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
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Làm mới accessToken
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body; 
    if (!refreshToken) {
      return res.status(401).json({ message: 'Không có refreshToken' });
    }

    const accessToken = await tokenService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// Đăng xuất
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Không tìm thấy refresh token" });
    }

    await tokenService.removeRefreshToken(refreshToken);

    res.json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

// doi mat khau
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    next(error);
  }
};


exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log("req.user", req.user);
    
    const email = req.user.emailAddress;

    await userService.sendVerificationEmail(userId, email);

    res.status(200).json({
      success: true,
      message: 'Email xác thực đã được gửi'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    await userService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: 'Xác thực email thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const {email} = req.body;
    await userService.requestResetPassword(email);

    res.json({ success: true, message: 'Đã gửi email đặt lại mật khẩu' });
  } catch (error) {
    next(error);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
}