const userService = require('../services/user.service');
const tokenService = require('../services/jwt.service');

// Đăng ký
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

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const { user, accessToken, refreshToken } = await userService.loginUser(identifier, password);

    res.json({
      success: true,
      data: { user, accessToken, refreshToken }
    });
  } catch (error) {
    next(error);
  }
};

// Làm mới accessToken
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const accessToken = await tokenService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

// Đăng xuất
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await tokenService.removeRefreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};