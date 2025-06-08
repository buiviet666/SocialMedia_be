const Report = require('../models/Report.model');

class ReportService {
  async createReport({ reporter, targetType, targetId, reason }) {
    return await Report.create({ reporter, targetType, targetId, reason });
  }

  async checkDuplicate(reporter, targetType, targetId) {
    return await Report.findOne({ reporter, targetType, targetId });
  }

  async reportUser(userId, targetUserId, reason) {
    return this.createReport({ reporter: userId, targetType: 'USER', targetId: targetUserId, reason });
  }

  async reportPost(userId, postId, reason) {
    return this.createReport({ reporter: userId, targetType: 'POST', targetId: postId, reason });
  }

  async reportComment(userId, commentId, reason) {
    return this.createReport({ reporter: userId, targetType: 'COMMENT', targetId: commentId, reason });
  }

  async reportMessage(userId, messageId, reason) {
    return this.createReport({ reporter: userId, targetType: 'MESSAGE', targetId: messageId, reason });
  }
}

module.exports = new ReportService();
