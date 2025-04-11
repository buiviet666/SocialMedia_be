const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Token = require('../models/Token.model');

// Tạo token JWT
const generateToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn
  });
};

// Xác thực token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }
};

const generateRefreshToken = async (userId) => {
  const expiresIn = '30d';
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày

  const token = generateToken({ userId }, expiresIn);

  await Token.create({
    user: userId,
    token,
    type: 'REFRESH',
    expiresAt
  });

  return token;
};

const generateVerifyEmailToken = async (userId) => {
  const expiresIn = '1h';
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const token = generateToken({ userId }, expiresIn);
  await Token.create({
    user: userId,
    token,
    type: 'VERIFY_EMAIL',
    expiresAt
  });

  return token;
}

// Xác thực token xác minh email
const verifyEmailToken = async (token) => {
  const decoded = verifyToken(token);

  const tokenDoc = await Token.findOne({
    token,
    user: decoded.userId,
    type: 'VERIFY_EMAIL',
  });

  if (!tokenDoc) {
    throw new Error('Token xác thực email không hợp lệ hoặc đã hết hạn');
  }

  return tokenDoc;
};

// Xoá token bất kỳ
const removeToken = async (token) => {
  await Token.findOneAndDelete({ token });
};

const generateResetPasswordToken = async (userId) => {
  const expiresIn = '1h';
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const token = generateToken({ userId }, expiresIn);

  await Token.create({
    user: userId,
    token,
    type: 'RESET_PASSWORD',
    expiresAt
  });

  return token;
};

const verifyResetPasswordToken = async (token) => {
  const decoded = verifyToken(token);

  const tokenDoc = await Token.findOne({
    token,
    user: decoded.userId,
    type: 'RESET_PASSWORD',
  });

  if (!tokenDoc) {
    throw new Error('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
  }

  return decoded;
};

// Làm mới accessToken từ refreshToken
const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);

  const tokenDoc = await Token.findOne({
    token: refreshToken,
    user: decoded.userId,
    type: 'REFRESH',
    blacklisted: false,
  });

  if (!tokenDoc) {
    throw new Error('Refresh token không hợp lệ');
  }

  // Tạo accessToken mới
  return generateToken({ userId: decoded.userId }, '1h');
};

// Xoá refreshToken khi logout
const removeRefreshToken = async (refreshToken) => {
  await Token.findOneAndDelete({ token: refreshToken, type: 'REFRESH' });
};

// Middleware xác thực JWT
const protect = async (req, res, next) => {
  let token;
  
  // Lấy token từ header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để truy cập tài nguyên này'
    });
  }

  try {
    // Xác thực token
    const decoded = verifyToken(token);

    // Tìm user và gắn vào request
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Phiên đăng nhập không hợp lệ'
    });
  }
};

// Kiểm tra vai trò người dùng
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này`
      });
    }
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  protect,
  authorize,
  generateRefreshToken,
  refreshAccessToken,
  removeRefreshToken,
  generateVerifyEmailToken,
  verifyEmailToken,
  removeToken,
  generateResetPasswordToken,
  verifyResetPasswordToken
};