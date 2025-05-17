const User = require('../models/User.model');
const AppError = require('../utils/appError');
const emailService  = require('./email.service');
const { generateToken, generateRefreshToken, generateVerifyEmailToken, verifyEmailToken, removeToken, generateResetPasswordToken, verifyResetPasswordToken } = require('./jwt.service');

class UserService {
  async createUser(userData) {
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

  async updateUser(id, updateData) {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    return user ? user.getPublicProfile() : null;
  }

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
      res.status(401).json({
        statusCode: 401,
        message: 'User does not exist!'
      })
    };

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

  async updateSocketId(userId, socketId) {
    return await User.findByIdAndUpdate(
      userId,
      { _idSocket: socketId },
      { new: true }
    );
  }
}

module.exports = new UserService();