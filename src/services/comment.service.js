const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");
const User = require('../models/User.model');
const sendNotification = require("../utils/sendNotification");
const { getIO } = require('../sockets/socket');

class CommentService {
  async getRootComments(postId) {
    const rootComments = await Comment.find({
      postId,
      parentCommentId: null,
    })
      .sort({ createdAt: -1 })
      .populate("userId", "_id userName nameDisplay avatar");

    const commentsWithReplyCount = await Promise.all(
      rootComments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          parentCommentId: comment._id,
        });

        return {
          ...comment.toObject(),
          totalReplies: replyCount,
        };
      })
    );

    return commentsWithReplyCount;
  }

  async getReplies(parentCommentId) {
    return await Comment.find({
      parentCommentId,
    })
      .sort({ createdAt: 1 })
      .populate("userId", "_id userName nameDisplay avatar");
  }

  async createComment({ postId, content, userId, parentCommentId = null }) {
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent || parent.parentCommentId) {
        throw new Error("Không thể trả lời bình luận con");
      }
    }

    const comment = await Comment.create({
      postId,
      content,
      userId,
      parentCommentId,
    });

    const populatedComment = await comment.populate("userId", "_id userName nameDisplay avatar");

    const currentUser = await User.findById(userId);
    const avatarUrl = currentUser?.avatar || '';

    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    if (!parentCommentId && post.userId.toString() !== userId.toString()) {
      await sendNotification({
        type: "COMMENT",
        senderId: userId,
        receiverId: post.userId,
        postId,
        message: `${currentUser.nameDisplay || currentUser.userName} has comment on your post`,
        redirectUrl: `/post/${postId}`,
        avatar: avatarUrl,
      });
    }

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (
        parent &&
        parent.userId.toString() !== userId.toString()
      ) {
        await sendNotification({
          type: "REPLY",
          senderId: userId,
          receiverId: parent.userId,
          postId,
          message: `${currentUser.nameDisplay || currentUser.userName} has reply your comment on your post`,
          redirectUrl: `/post/${postId}#${comment._id}`,
          avatar: avatarUrl,
        });
      }
    }

    // 🔴 Emit socket
    const io = getIO();
    io.to(`post_${postId}`).emit("comment_created", populatedComment);

    return populatedComment;
  }

  async updateComment(commentId, content, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId.toString()) {
      throw new Error("Permission denied");
    }

    comment.content = content;
    await comment.save();

    return await comment.populate("userId", "_id userName nameDisplay avatar");
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId.toString()) {
      throw new Error("Permission denied");
    }

    await comment.deleteOne();

    const io = getIO();
    io.to(`post_${comment.postId}`).emit("comment_deleted", { commentId });

    return comment;
  }

  async toggleLike(commentId, userId) {
    const comment = await Comment.findById(commentId).populate("userId", "_id userName nameDisplay avatar");
    if (!comment) throw new Error("Comment not found");

    const index = comment.likes.findIndex((id) => id.toString() === userId.toString());
    let liked = false;

    if (index === -1) {
      comment.likes.push(userId);
      liked = true;

      if (comment.userId._id.toString() !== userId.toString()) {
        await sendNotification({
          type: "LIKE",
          senderId: userId,
          receiverId: comment.userId._id,
          message: "đã thích bình luận của bạn",
          redirectUrl: `/posts/${comment.postId}#${comment._id}`,
          extraData: { commentId }
        });
      }
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();

    const io = getIO();
    io.to(`post_${comment.postId}`).emit("comment_liked", {
      commentId,
      liked,
      totalLikes: comment.likes.length
    });

    return { liked, data: comment };
  }
}

module.exports = new CommentService();
