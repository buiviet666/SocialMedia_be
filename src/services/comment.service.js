const Comment = require("../models/Comment.model");

class CommentService {
  async getRootComments(postId) {
    const rootComments = await Comment.find({
      postId,
      parentCommentId: null,
    })
      .sort({ createdAt: -1 })
      .populate("userId", "_id userName nameDisplay avatar");

    // Đếm totalReplies cho từng bình luận gốc
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
      .sort({ createdAt: 1 }) // cũ trước
      .populate("userId", "_id userName nameDisplay avatar");
  }

  async createComment({ postId, content, userId, parentCommentId = null }) {
    // Optional: kiểm tra postId và parentCommentId có tồn tại không
    // Nếu là reply, không được trả lời bình luận con
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent || parent.parentCommentId)
        throw new Error("Cannot reply to a nested comment");
    }

    const comment = await Comment.create({
      postId,
      content,
      userId,
      parentCommentId,
    });

    return await comment.populate("userId", "_id userName nameDisplay avatar");
  }

  async updateComment(commentId, content, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId.toString())
      throw new Error("Permission denied");

    comment.content = content;
    await comment.save();

    return await comment.populate("userId", "_id userName nameDisplay avatar");
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId.toString())
      throw new Error("Permission denied");

    await comment.deleteOne();
    return comment;
  }

  async toggleLike(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    const index = comment.likes.findIndex((id) => id.toString() === userId.toString());

    let liked = false;

    if (index === -1) {
      comment.likes.push(userId);
      liked = true;
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();

    const data = await comment.populate("userId", "_id userName nameDisplay avatar");

    return { liked, data };
  }
}

module.exports = new CommentService();
