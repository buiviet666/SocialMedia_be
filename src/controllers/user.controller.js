const userService = require('../services/user.service');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user._id, req.body);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSocketId = async (req, res, next) => {
  try {
    const user = await userService.updateSocketId(
      req.user._id,
      req.body.socketId
    );
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};