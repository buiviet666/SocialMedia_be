const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 255,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      }
    ],
    reports: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          maxLength: 255,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    isHidden: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['VISIBLE', 'HIDDEN'],
      default: 'VISIBLE'
    }
  },
  {
    collection: "Comments",
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Comments', commentSchema);
