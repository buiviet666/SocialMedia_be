const userService = require('../services/user.service');

exports.register = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const { user, token } = await userService.loginUser(identifier, password);
    
    res.json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};