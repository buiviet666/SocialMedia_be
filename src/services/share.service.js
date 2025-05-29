const Share = require('../models/Share.model');

class ShareService {
  async createShare(userId, postId, message) {
    const newShare = new Share({
      sharedBy: userId,
      postId,
      message
    });

    await newShare.save();
    return newShare;
  }

  async getSharesByUser(userId) {
    return await Share.find({ sharedBy: userId }).populate('postId').sort({ createdAt: -1 });
  }
}

module.exports = new ShareService();
