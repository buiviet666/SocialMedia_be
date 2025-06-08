const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['USER', 'POST', 'HASHTAG'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  keyword: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Có thể thêm chỉ số để tăng hiệu suất truy vấn
SearchHistorySchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
