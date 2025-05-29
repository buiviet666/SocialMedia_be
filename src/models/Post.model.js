const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    privacy: {
        type: String,
        enum: ['PUBLIC', 'FRIENDS', 'PRIVATE', 'FRIENDONLY', 'EXCEPTFRIEND'],
        default: 'PUBLIC'
    },
    visibilitySetting: {
        type: new mongoose.Schema({
            type: {
                type: String,
                enum: ['ALLOWED', 'EXCLUDED'],
                required: true
            },
            userIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        }, { _id: false }),
        required: function () {
            return this.privacy === 'FRIENDONLY' || this.privacy === 'EXCEPTFRIEND';
        },
        default: undefined
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: { type: String, trim: true },
    photoUrls: [{
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true }
    }],
    isEdited: { type: Boolean, default: false },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'HIDDEN'],
        default: 'ACTIVE'
    },
    reportCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Post', PostSchema);