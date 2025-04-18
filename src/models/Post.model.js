const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    privacy: {
        type: String,
        enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'],
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
            return this.privacy === 'FRIENDS';
        },
        default: undefined
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    photoUrls: [{
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true }
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }    
},
{
    timestamps: true,
});

module.exports = mongoose.model('Post', PostSchema);