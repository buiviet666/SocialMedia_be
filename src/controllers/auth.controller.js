const userService = require('../services/user.service');
const tokenService = require('../services/jwt.service');

// register
exports.register = async (req, res, next) => {
  try {
    const {userName, password, emailAddress} = req.body;

    await userService.createUser({userName, password, emailAddress});
    res.status(201).json({
      statusCode: 201,
      message: 'Register success!'
    });
  } catch (error) {
    next(error);
  }
};

// login
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const { user, accessToken, refreshToken } = await userService.loginUser(identifier, password);

    res.status(200).json({
      statusCode: 200,
      message: 'Login success!',
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

// logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        statusCode: 400,
        message: "Not found refresh token"
      });
    }

    await tokenService.removeRefreshToken(refreshToken);

    res.status(200).json({
      statusCode: 200,
      message: "Logout success!",
    });
  } catch (error) {
    next(error);
  }
};

// reset accessToken
exports.refreshToken = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        statusCode: 400,
        message: "Not found refresh token"
      });
    }

    const accessToken = await tokenService.refreshAccessToken(refreshToken);

    res.status(200).json({
      statusCode: 200,
      data: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// change password during login
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    await userService.changePasswordProcess(userId, currentPassword, newPassword);

    res.status(200).json({
      statusCode: 200,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// send email verify 
exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const email = req.user.emailAddress;

    await userService.sendVerificationEmail(userId, email);

    res.status(200).json({
      statusCode: 200,
      message: 'Verification email has been sent'
    });
  } catch (error) {
    next(error);
  }
};

// confirm verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    await userService.verifyEmail(token);

    res.status(200).json({
      statusCode: 200,
      message: 'Verification email has been success!'
    });
  } catch (error) {
    next(error);
  }
};

// send forgot password verify
exports.forgotPassword = async (req, res, next) => {
  try {
    const {email} = req.body;
    await userService.requestResetPassword(email);

    res.status(200).json({
      statusCode: 200,
      message: 'Password reset password has been sent'
    });
  } catch (error) {
    next(error);
  }
}

// confirm verify reset password forgot
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);

    res.status(200).json({
      statusCode: 200,
      message: 'Password reset successful!'
    });
  } catch (error) {
    next(error);
  }
}