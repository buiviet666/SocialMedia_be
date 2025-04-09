const User = require('../models/User.model');
const { generateToken } = require('./jwt.service');

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

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async loginUser(identifier, password) {
    // Cho phép đăng nhập bằng username hoặc email
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { emailAddress: identifier }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }

    if (user.statusAcc !== 'active') {
      throw new Error('Tài khoản chưa được kích hoạt');
    }

    await user.updateLastLogin();
    const token = generateToken({ userId: user._id });

    return {
      user: user.getPublicProfile(),
      token
    };
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