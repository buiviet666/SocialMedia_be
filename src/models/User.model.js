const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới']
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
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Email không hợp lệ'
        }
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isMobilePhone(v, 'any', { strictMode: false });
            },
            message: 'Số điện thoại không hợp lệ'
        }
    },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác', 'Không xác định'],
        default: 'Không xác định'
    },
    dateOfBirth: {
        type: Date,
        validate: {
          validator: function(v) {
            return v <= new Date();
          },
          message: 'Ngày sinh không thể ở tương lai'
        }
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
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
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Cập nhật lastLogin khi user đăng nhập
UserSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};
  
// So sánh password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
  
// Tạo phương thức để lấy thông tin public (không bao gồm password)
UserSchema.methods.getPublicProfile = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Index cho các trường thường xuyên query
UserSchema.index({ username: 1 });
UserSchema.index({ emailAddress: 1 });
UserSchema.index({ statusAcc: 1 });

module.exports = mongoose.model('User', UserSchema);