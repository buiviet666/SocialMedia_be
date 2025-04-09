const { verifyToken } = require('../services/jwt.service');
const User = require('../models/User.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập'
      });
    }

    // Xác thực token
    const decoded = verifyToken(token);
    
    // Tìm user và gắn vào request
    req.user = await User.findOne({ 
      _id: decoded.userId,
      statusAcc: 'active' // Chỉ cho phép user active
    }).select('-password');

    if (!req.user) {
      throw new Error('Người dùng không tồn tại hoặc chưa được kích hoạt');
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Xác thực không thành công'
    });
  }
};

module.exports = authMiddleware;