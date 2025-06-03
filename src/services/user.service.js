const User = require('../models/User.model');
const AppError = require('../utils/appError');
const emailService  = require('./email.service');
const { generateToken, generateRefreshToken, generateVerifyEmailToken, verifyEmailToken, removeToken, generateResetPasswordToken, verifyResetPasswordToken } = require('./jwt.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.helper');

class UserService {
  async createUser(userData) {
    const existingUser = await User.findOne({ emailAddress: userData.emailAddress });
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const user = new User(userData);
    await user.save();
  }

  async loginUser(identifier, password) {
    const user = await User.findOne({
      $or: [
        { userName: identifier },
        { emailAddress: identifier }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect login password information!', 404);
    }

    await user.updateLastLogin();

    const accessToken = generateToken({ userId: user._id }, '1h');
    const refreshToken = await generateRefreshToken(user._id);

    return {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken
    };
  }

  async findByUsername(username) {
    return await User.findOne({ username }).select('+password');
  }

  async findByEmail(email) {
    return await User.findOne({ emailAddress: email }).select('+password');
  }

  async findById(id) {
    return await User.findById(id);
  }

  // async updateUser(id, updateData) {
  //   const user = await User.findByIdAndUpdate(id, updateData, {
  //     new: true,
  //     runValidators: true
  //   });
  //   return user ? user.getPublicProfile() : null;
  // }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async changePasswordProcess(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User does not exist!'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Password is incorrect!'
      });
    }

    user.password = newPassword;
    await user.save();
  }

  async sendVerificationEmail(userId, email) {
    const token = await generateVerifyEmailToken(userId);

    await emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail(token) {
    const tokenDoc = await verifyEmailToken(token);
    const user = await User.findById(tokenDoc.user);
    if (!user) {
      throw new AppError('User does not exist!', 401);
    }
    user.statusAcc = 'ACTIVE';
    await user.save();
    await tokenDoc.deleteOne();
  }

  async requestResetPassword(email) {
    const user = await User.findOne({ emailAddress: email });
    
    if (!user) {
      res.status(401).json({
        statusCode: 401,
        message: 'Email does not exist!'
      })
    };

    const token = await generateResetPasswordToken(user._id);
    await emailService.sendResetPasswordEmail(user.emailAddress, token);
  }

  async resetPassword(token, newPassword) {
    const { userId } = await verifyResetPasswordToken(token);
    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({
        statusCode: 401,
        message: 'User does not exist!'
      })
    };

    user.password = newPassword;
    await user.save();
    await removeToken(token);
  }

  async getUserById (userId) {
    const user = await User.findById(userId)
      .populate('followers', 'userName avatar')
      .populate('following', 'userName avatar');
    if (!user) throw new AppError('No user found', 403);
    return user.getPublicProfile();
  };

  async updateProfile(userId, updateData) {
    const allowedFields = ['nameDisplay', 'bio', 'phoneNumber', 'gender', 'dateOfBirth', 'avatar'];
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    if (!user) {
      throw new AppError('User not found for update', 404);
    }

    return user.getPublicProfile();
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      throw new AppError('New password must be different from the old password', 400);
    }
    user.password = newPassword;
    await user.save();
    return true;
  }

  async changeEmail(userId, password, newEmail) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Password is incorrect', 401);
    }
    if (user.emailAddress === newEmail) {
      throw new AppError('New email must be different from the current email', 400);
    }
    const existing = await User.findOne({ emailAddress: newEmail });
    if (existing) {
      throw new AppError('Email already exists', 400);
    }
    user.emailAddress = newEmail;
    user.statusAcc = 'NOACTIVE';
    await user.save();
    await this.sendVerificationEmail(user._id, newEmail);
    return true;
  }

  async updateAvatar(userId, fileBuffer) {
    if (!fileBuffer) {
      throw new AppError('No image file provided', 400);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.avatar && user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }
    const result = await uploadToCloudinary(fileBuffer, 'avatars');
    user.avatar = result.url;
    user.avatarPublicId = result.publicId;
    await user.save();
    return user.getPublicProfile();
  }

  async followUser(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw new AppError('You cannot follow yourself', 400);
    }
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('Target user not found', 404);
    }
    if (currentUser.following.includes(targetUserId)) {
      throw new AppError('Already following this user', 400);
    }
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    await currentUser.save();
    await targetUser.save();
    return true;
  }

  async unfollowUser(currentUserId, targetUserId) {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('Target user not found', 404);
    }
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    await currentUser.save();
    await targetUser.save();
    return true;
  }

  async blockUser(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw new AppError('You cannot block yourself', 400);
    }
    const user = await User.findById(currentUserId);
    const target = await User.findById(targetUserId);
    if (!target) throw new AppError('Target user not found', 404);
    if (user.blockedUsers.includes(targetUserId)) {
      throw new AppError('Already blocked this user', 400);
    }
    user.blockedUsers.push(targetUserId);
    await user.save();
    return true;
  }

  async unblockUser(currentUserId, targetUserId) {
    const user = await User.findById(currentUserId);
    const target = await User.findById(targetUserId);
    if (!target) throw new AppError('Target user not found', 404);
    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );
    await user.save();
    return true;
  }

  async getBlockedUsers(userId) {
    const user = await User.findById(userId).populate('blockedUsers', 'userName avatar nameDisplay');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.blockedUsers;
  }

  async getRecommendedUsers(userId, limit = 10) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }
    // Danh sách loại trừ: chính mình + đã follow + đã chặn hoặc bị chặn
    const excludedUserIds = [
      userId,
      ...currentUser.following.map(id => id.toString()),
      ...currentUser.blockedUsers.map(id => id.toString())
    ];
    // Tìm những người chưa bị chặn và chưa follow
    const recommended = await User.find({
      _id: { $nin: excludedUserIds },
      // statusAcc: 'ACTIVE'
    })
    .limit(limit)
    .select('userName nameDisplay avatar bio');
    return recommended;
  }

  async deleteOwnAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    // Optional: Xóa user khỏi followers/following của người khác
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await user.deleteOne();
    return true;
  }

  async getUsersByIds(ids) {
    const users = await User.find({ _id: { $in: ids } })
      .select('_id userName nameDisplay avatar')
      .lean();
    return users;
  }

  async updateSocketId(userId, socketId) {
    return await User.findByIdAndUpdate(
      userId,
      { _idSocket: socketId },
      { new: true }
    );
  }
}

module.exports = new UserService();