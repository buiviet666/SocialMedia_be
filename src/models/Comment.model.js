const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    like: { type: Number, default: 0 },
    content: { type: String, maxLength: 255 },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
    },
  },
  {
    collection: "Comments",
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Comments', commentSchema);
