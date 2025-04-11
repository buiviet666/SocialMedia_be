const User = require('../models/User.model');
const emailService  = require('./email.service');
const { generateToken, generateRefreshToken, generateVerifyEmailToken, verifyEmailToken, removeToken, generateResetPasswordToken, verifyResetPasswordToken } = require('./jwt.service');

class UserService {
  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user.getPublicProfile();
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

  // xoa tai khoan
  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async loginUser(identifier, password) {
    // Cho phép đăng nhập bằng username hoặc email
    const user = await User.findOne({
      $or: [
        { userName: identifier },
        { emailAddress: identifier }
      ]
    }).select('+password');
    console.log("user", user);
    

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }

    // if (user.statusAcc !== 'active') {
    //   throw new Error('Tài khoản chưa được kích hoạt');
    // }

    const accessToken = generateToken({ userId: user._id }, '1h');
    const refreshToken = await generateRefreshToken(user._id);

    return {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('Người dùng không tồn tại');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new Error('Mật khẩu không đúng!');

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

    if (!user) throw new Error('Người dùng không tồn tại');

    user.statusAcc = 'ACTIVE';
    await user.save();
    await tokenDoc.deleteOne();
  }

  async requestResetPassword(email) {
    const user = await User.findOne({ emailAddress: email });
    
    if (!user) throw new Error('Email không tồn tại');

    const token = await generateResetPasswordToken(user._id);
    await emailService.sendResetPasswordEmail(user.emailAddress, token);
  }

  async resetPassword(token, newPassword) {
    const { userId } = await verifyResetPasswordToken(token);

    const user = await User.findById(userId);
    if (!user) throw new Error('Người dùng không tồn tại');

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