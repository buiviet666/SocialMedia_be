const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 6,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username must contain only letters, numbers and underscores']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        select: false,
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email'
        }
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isMobilePhone(v, 'any', { strictMode: false });
            },
            message: 'Invalid phone number'
        }
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Unknown'],
        default: 'Unknown'
    },
    dateOfBirth: {
        type: Date,
        validate: {
          validator: function(v) {
            return v <= new Date();
          },
          message: 'Date of birth cannot be in the future'
        }
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    statusAcc: {
        type: String,
        enum: ['ACTIVE', 'NOACTIVE'],
        default: 'NOACTIVE'
    },
    lastLogin: {
        type: Date
    },
    socketId: {
        type: String,
        default: null
    },
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }], 
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// check hash password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Update time last Login
UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};
  
// compare password
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
  
// get info profile (hide password)
UserSchema.methods.getPublicProfile = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', UserSchema);