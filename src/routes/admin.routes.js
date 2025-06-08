const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const {protect, authorize} = require('../services/jwt.service');

router.get("/reported-users", protect, authorize("ADMIN"), adminController.getReportedUsers);
router.post("/users/:id/ban", protect, authorize("ADMIN"), adminController.banUser);
router.post("/users/:id/unban", protect, authorize("ADMIN"), adminController.unbanUser);
router.delete("/report/user/:id", protect, authorize("ADMIN"), adminController.deleteUserReports);

router.get("/posts/reported", protect, authorize("ADMIN"), adminController.getReportedPosts);
router.patch('/posts/:postId/ban', protect, authorize("ADMIN"), adminController.banPost);
router.patch('/posts/:postId/unban', protect, authorize("ADMIN"), adminController.unbanPost);
router.delete("/posts/:postId", protect, authorize("ADMIN"), adminController.deleteReportedPost);

router.get('/statistics/overview', protect, authorize("ADMIN"), adminController.getDashboardOverview);
router.get('/statistics/posts-by-date', protect, authorize("ADMIN"), adminController.getPostStatsByDate);
router.get('/statistics/hot-posts', protect, authorize("ADMIN"), adminController.getHotPosts);

router.get("/messages/reported", protect, authorize("ADMIN"), adminController.getReportedMessages);
router.patch("/messages/:id/ban", protect, authorize("ADMIN"), adminController.banMessage);
router.patch("/messages/:id/unban", protect, authorize("ADMIN"), adminController.unbanMessage);
router.patch("/messages/:id/resolve-reports", protect, authorize("ADMIN"), adminController.resolveMessageReports);
router.delete("/messages/:id", protect, authorize("ADMIN"), adminController.deleteMessage);

router.get("/comments/reported", protect, authorize("ADMIN"), adminController.getReportedComments);
router.patch("/comments/:id/ban", protect, authorize("ADMIN"), adminController.banComment);
router.patch("/comments/:id/unban", protect, authorize("ADMIN"), adminController.unbanComment);
router.patch("/comments/:id/resolve-reports", protect, authorize("ADMIN"), adminController.resolveCommentReports);
router.delete("/comments/:id", protect, authorize("ADMIN"), adminController.deleteComment);

router.get('/users', protect, authorize("ADMIN"), adminController.getAllUsersExceptMe);
router.get('/users/search', protect, authorize("ADMIN"), adminController.searchUsers);

router.get('/posts', protect, authorize('ADMIN'), adminController.getAllPosts);
router.get('/posts/search', protect, authorize('ADMIN'), adminController.searchPosts);

module.exports = router;