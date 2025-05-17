const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Token = require('../models/Token.model');

// create token JWT
const generateToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn
  });
};

// create refresh token
const generateRefreshToken = async (userId) => {
  const expiresIn = '30d';
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const token = generateToken({ userId }, expiresIn);

  await Token.create({
    user: userId,
    token,
    type: 'REFRESH',
    expiresAt
  });

  return token;
};

// create verify email token 
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
};

// create reset password token
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

// verify token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }
};

// verify token email
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

// verify token reset password 
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

// delete token
const removeToken = async (token) => {
  await Token.findOneAndDelete({ token });
};

// refresh access token
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

  return generateToken({ userId: decoded.userId }, '1h');
};


// delete refresh token (logout)
const removeRefreshToken = async (refreshToken) => {
  await Token.findOneAndDelete({ token: refreshToken, type: 'REFRESH' });
};

// Middleware verify JWT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        message: "Please login to access this resource",
      });
    }

    const token = authHeader.split(' ')[1];
    console.log("token", token);
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User does not exist'
      });
    }
    req.user = user;
    console.log("req.user", req.user);
    
    next();
  } catch (error) {
    res.status(401).json({
      statusCode: 401,
      message: error.message || 'Authorization failed'
    });
  }
};

// check role
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