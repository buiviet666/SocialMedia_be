const Report = require('../models/Report.model');

class ReportService {
  async reportUser(userId, targetUserId, reason) {
    return await Report.create({
      reporter: userId,
      targetType: 'USER',
      targetId: targetUserId,
      reason
    });
  }

  async reportPost(userId, postId, reason) {
    return await Report.create({
      reporter: userId,
      targetType: 'POST',
      targetId: postId,
      reason
    });
  }

  async reportComment(userId, commentId, reason) {
    return await Report.create({
      reporter: userId,
      targetType: 'COMMENT',
      targetId: commentId,
      reason
    });
  }
}

module.exports = new ReportService();
