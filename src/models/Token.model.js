const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['access', 'refresh', 'reset-password', 'verify-email'],
        default: 'refresh',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    blacklisted: {
        type: Boolean,
        default: false,
    }
});

TokenSchema.index({ token: 1 });
TokenSchema.index({ user: 1 });

module.exports = mongoose.model('Token', TokenSchema);