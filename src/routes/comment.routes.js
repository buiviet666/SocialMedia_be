const express = require("express");
const router = express.Router();

const commentController = require('../controllers/comment.controller');

router.get(
  "/bypost/:id",
  commentController.getCommentsByPostId
);
router.post(
  "/",
  commentController.createComment
);
router.put(
  "/:id",
  commentController.updateComment
);
router.delete(
  "/:id",
  commentController.deleteComment
);

module.exports = router;

// const createComment = {
//   body: Joi.object().keys({
//     postId: Joi.string().required().custom(objectId),
//     userId: Joi.string().required().custom(objectId),
//     content: Joi.string().max(255).required(),
//     like: Joi.number(),
//     parentCommentId: Joi.optional().custom(objectId),
//   }),
// };
// const updateComment = {
//   params: Joi.object().keys({
//     id: Joi.required().custom(objectId),
//   }),
//   body: Joi.object().keys({
//     content: Joi.string().required(),
//   }),
// };
// const deleteComment = {
//   params: Joi.object().keys({
//     id: Joi.required().custom(objectId),
//   }),
// };
// const getCommentByPostId = {
//   params: Joi.object().keys({
//     id: Joi.required().custom(objectId),
//   }),
// };
