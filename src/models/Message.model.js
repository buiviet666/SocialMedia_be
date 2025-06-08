const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    required: true
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE'],
    default: 'TEXT'
  },
  status: {
    type: String,
    enum: ['SENT', 'EDITED', 'DELETED', 'HIDDEN'], // ✅ thêm 'HIDDEN' để admin có thể ẩn
    default: 'SENT'
  },
  seenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  deliveredTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,

  deletedAt: {
    type: Date,
    default: null
  }
});

// ✅ Cập nhật `updatedAt` mỗi khi save
MessageSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// ✅ Populate mặc định
MessageSchema.pre(/^find/, function (next) {
  this.populate("senderId", "_id nameDisplay userName avatar");
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
