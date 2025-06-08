const commentService = require("../services/comment.service");

// Get root-level comments of a post
exports.getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await commentService.getRootComments(postId);
    return res.status(200).json({
      statusCode: 200,
      message: "Fetched root comments successfully",
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

// Get 1-level replies of a comment
exports.getReplies = async (req, res, next) => {
  try {
    const { parentCommentId } = req.params;
    const replies = await commentService.getReplies(parentCommentId);
    return res.status(200).json({
      statusCode: 200,
      message: "Fetched replies successfully",
      data: replies,
    });
  } catch (err) {
    next(err);
  }
};

// Create a new comment (root or reply)
exports.createComment = async (req, res, next) => {
  try {
    const { postId, content, parentCommentId = null } = req.body;
    const userId = req.user._id;

    const comment = await commentService.createComment({ postId, content, userId, parentCommentId });

    return res.status(201).json({
      statusCode: 201,
      message: parentCommentId ? "Reply created successfully" : "Comment created successfully",
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// Update comment
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const updated = await commentService.updateComment(id, content, userId);
    return res.status(200).json({
      statusCode: 200,
      message: "Comment updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deleted = await commentService.deleteComment(id, userId);
    return res.status(200).json({
      statusCode: 200,
      message: "Comment deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

// toggle like
exports.toggleLikeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await commentService.toggleLike(id, userId);

    return res.status(200).json({
      statusCode: 200,
      message: comment.liked ? "likedCmt" : "unlikedCmt",
      data: comment.data,
    });
  } catch (err) {
    next(err);
  }
};