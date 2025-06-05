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

  async reportMessage(userId, messageId, reason) {
    return await Report.create({
      reporter: userId,
      targetType: 'MESSAGE',
      targetId: messageId,
      reason
    });
  }

  async createReport({ reporter, targetType, targetId, reason }) {
    const report = await Report.create({
      reporter,
      targetType,
      targetId,
      reason,
    });
    return report;
  }

  async checkDuplicate(reporter, targetType, targetId) {
    return await Report.findOne({ reporter, targetType, targetId });
  }
}

module.exports = new ReportService();
