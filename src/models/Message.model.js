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
    enum: ['SENT', 'EDITED', 'DELETED'],
    default: 'SENT'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

MessageSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
