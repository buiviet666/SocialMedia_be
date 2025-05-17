const { verifyToken } = require('../services/jwt.service');
const User = require('../models/User.model');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader  = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Please login to access',
      });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken (token);
    
    const user = await User.findOne({ 
      _id: decoded.userId,
      statusAcc: 'ACTIVE'
    }).select('-password');

    if (!user) {
      return res.status(403).json({
        statusCode: 403,
        message: 'User does not exist or is not activated',
      })
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({
      statusCode: 403,
      message: error.message || 'Authentication failed'
    });
  }
};

module.exports = authMiddleware;