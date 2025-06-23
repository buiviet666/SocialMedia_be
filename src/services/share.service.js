const Share = require('../models/Share.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const sendNotification = require("../utils/sendNotification");
const { getIO } = require('../sockets/socket');

class ShareService {
  async createShare(userId, postId, message) {
    const post = await Post.findById(postId).populate("userId", "_id");
    const userShare = await User.findById(userId);
    const avatarUrl = userShare?.avatar || '';
    if (!post) {
      throw new Error("Post not found!");
    }
    const newShare = new Share({
      sharedBy: userId,
      postId,
      message
    });

    await newShare.save();

    if (post && post.userId._id.toString() !== userId.toString()) {
      // sent notification
      await sendNotification({
        type: "SHARE",
        senderId: userId,
        receiverId: post.userId._id,
        postId,
        message: `${userShare.nameDisplay || userShare.userName} has shared your post`,
        redirectUrl: `/post/${postId}`,
        avatar: avatarUrl,
      });

      // Emit socket to user
      const io = getIO();
      io.to(post.userId._id.toString()).emit("post_shared", {
        postId,
        sharedBy: userId
      });
    }

    return newShare;
  }

  async getSharesByUser(userId) {
    return await Share.find({ sharedBy: userId }).populate('postId').sort({ createdAt: -1 });
  }

}

module.exports = new ShareService();
