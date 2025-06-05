const userService = require('../services/user.service');
const AppError = require('../utils/appError');

// get profile
exports.getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      statusCode: 200,
      message: "Get information of successfully logged in user!",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// get profile by user id
exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json({
      statusCode: 200,
      message: "Get information profile successfully!",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// update profile
exports.updateCurrentUserProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user._id, req.body);
    res.status(200).json({
      statusCode: 200,
      message: 'Personal information updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Missing required fields!', 404);
    }

    await userService.changePassword(req.user._id, currentPassword, newPassword);

    res.status(200).json({
      statusCode: 200,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change email
exports.changeEmail = async (req, res, next) => {
  try {
    const { password, newEmail } = req.body;

    if (!password || !newEmail) {
      throw new AppError('Missing required fields', 400);
    }

    await userService.changeEmail(req.user._id, password, newEmail);

    res.status(200).json({
      statusCode: 200,
      message: 'Email updated successfully. Please verify your new email address.'
    });
  } catch (error) {
    next(error);
  }
};

// Update avantar
exports.updateAvatar = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateAvatar(req.user._id, req.file?.buffer);
    res.status(200).json({
      statusCode: 200,
      message: 'Avatar updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// follow user
exports.followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    await userService.followUser(req.user._id, targetUserId);

    res.status(200).json({
      statusCode: 200,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// unfollow user
exports.unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    await userService.unfollowUser(req.user._id, targetUserId);

    res.status(200).json({
      statusCode: 200,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// block user
exports.blockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    await userService.blockUser(req.user._id, targetUserId);

    res.status(200).json({
      statusCode: 200,
      message: 'User has been blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// unblock user
exports.unblockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    await userService.unblockUser(req.user._id, targetUserId);

    res.status(200).json({
      statusCode: 200,
      message: 'User has been unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// get list block users
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const blockedUsers = await userService.getBlockedUsers(req.user._id);
    res.status(200).json({
      statusCode: 200,
      message: 'Blocked users retrieved successfully',
      data: blockedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get list friend recommendation
exports.getFriendRecommendations = async (req, res, next) => {
  try {
    const users = await userService.getRecommendedUsers(req.user._id);
    res.status(200).json({
      statusCode: 200,
      message: 'Friend recommendations retrieved successfully',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// delete account
exports.deleteOwnAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await userService.deleteOwnAccount(userId);
    res.status(200).json({
      statusCode: 200,
      message: 'Your account has been deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// get list users id
exports.getUsersByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('List of invalid user Ids', 400);
    }

    const users = await userService.getUsersByIds(ids);
    res.status(200).json({
      statusCode: 200,
      message: 'Successfully!',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// get list friends
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const friends = await userService.getFriends(userId);

    res.status(200).json({
      statusCode: 200,
      message: "Friends fetched successfully",
      data: friends,
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