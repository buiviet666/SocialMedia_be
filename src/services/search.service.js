const SearchHistory = require('../models/SearchHistory.model');
const User = require('../models/User.model');
const Post = require('../models/Post.model');

class SearchService {
  async getHistoryByUser(userId) {
    return await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .populate('targetId');
  }

  async addHistory(userId, type, targetId, keyword = '') {
    const existing = await SearchHistory.findOne({ userId, type, targetId });
    if (existing) {
      existing.createdAt = new Date();
      existing.keyword = keyword;
      await existing.save();
      return existing;
    }
    const newHistory = new SearchHistory({
      userId,
      type,
      targetId,
      keyword
    });
    await newHistory.save();
    return newHistory;
  }

  async deleteHistoryItem(userId, historyId) {
    return await SearchHistory.findOneAndDelete({ _id: historyId, userId });
  }

  async clearAllHistory(userId) {
    return await SearchHistory.deleteMany({ userId });
  }

  async searchAll(keyword) {
    const regex = new RegExp(keyword, 'i');
    const users = await User.find({
      $or: [
        { userName: { $regex: regex } },
        { displayName: { $regex: regex } }
      ]
    }).select('_id userName displayName avatar');
    const posts = await Post.find({
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } }
      ]
    }).populate('userId', '_id userName displayName avatar');
    return { users, posts };
  }

  async searchByHashtag(tag) {
    const regex = new RegExp(`#${tag}\\b`, 'i');
    const posts = await Post.find({ content: { $regex: regex } })
      .populate('userId', '_id userName displayName avatar')
      .sort({ createdAt: -1 });
    return posts;
  }

    async getSuggestions(userId) {
      const history = await SearchHistory.find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('keyword type targetId');
      return { recent: history };
    }

}

module.exports = new SearchService();
