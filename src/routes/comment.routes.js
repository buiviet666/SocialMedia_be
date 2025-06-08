const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment.controller");
const { protect } = require('../services/jwt.service');

// Lấy danh sách bình luận gốc trong 1 bài viết
router.get("/post/:postId", CommentController.getCommentsByPost);

// Lấy danh sách trả lời của 1 bình luận
router.get("/:parentCommentId/replies", CommentController.getReplies);

// Thêm bình luận mới (gốc hoặc trả lời tùy theo body)
router.post("/", protect, CommentController.createComment);

// Sửa bình luận (chỉ chủ sở hữu)
router.put("/:id", protect, CommentController.updateComment);

// Xoá bình luận (chỉ chủ sở hữu)
router.delete("/:id", protect, CommentController.deleteComment);

// Thích hoặc bỏ thích bình luận
router.post("/:id/like", protect, CommentController.toggleLikeComment);

module.exports = router;
