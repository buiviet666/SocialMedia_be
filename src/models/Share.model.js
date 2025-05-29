const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Share', ShareSchema);
