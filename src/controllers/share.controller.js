const shareService = require('../services/share.service');

// share post
exports.sharePost = async (req, res, next) => {
  try {
    const { postId, message } = req.body;

    if (!postId) {
        throw new AppError('PostId is require!', 400);
    }

    const share = await shareService.createShare(req.user._id, postId, message);

    res.status(201).json({
      statusCode: 201,
      message: 'Shared the article successfully!',
      data: share
    });
  } catch (err) {
    next(err);
  }
};

// get all shares post
exports.getMyShares = async (req, res, next) => {
  try {
    const shares = await shareService.getSharesByUser(req.user._id);

    res.status(200).json({
      statusCode: 201,
      message: 'Get data successfully!',
      data: shares
    });
  } catch (err) {
    next(err);
  }
};

// GET shares by specific userId
exports.getSharesByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const shares = await shareService.getSharesByUser(userId);

    res.status(200).json({
      statusCode: 200,
      message: 'Get shared posts by user successfully!',
      data: shares
    });
  } catch (err) {
    next(err);
  }
};