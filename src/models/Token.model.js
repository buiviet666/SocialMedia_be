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
        enum: ['REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL'],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true
});

// check expires auto delete data
TokenSchema.index({
    expiresAt: 1
}, {
    expireAfterSeconds: 0
})

module.exports = mongoose.model('Token', TokenSchema);