const commentService = require("../services/comment.service");
exports.getCommentsByPostId = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const result = await commentService.getCommentByPostId(postId);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

exports.createComment = async (req, res, next) => {
  try {
    const { parentCommentId = null } = req.body;
    const data = { ...req.body, parentCommentId: parentCommentId };
    const comment = await commentService.createComment(data);
    res.json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
}

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
}

exports.deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id);
    res.json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}