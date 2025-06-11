const express = require('express');
const router = express.Router();
const { protect } = require('../services/jwt.service');
const notificationController = require('../controllers/notification.controller');

// 1. Tạo thông báo
router.post('/', protect, notificationController.createNotification);

// 2. Lấy danh sách thông báo
router.get('/', protect, notificationController.getAllNotifications);

// 3. Đánh dấu 1 thông báo đã đọc
router.put('/:id/read', protect, notificationController.markAsRead);

// 4. Đánh dấu tất cả thông báo đã đọc
router.put('/read-all', protect, notificationController.markAllAsRead);

// 5. Xóa 1 thông báo
router.delete('/:id', protect, notificationController.deleteNotification);

// 6. Xóa tất cả thông báo
router.delete('/clear-all', protect, notificationController.deleteAllNotifications);

// 7. Lấy số lượng chưa đọc
router.get('/unread-count', protect, notificationController.getUnreadCount);

module.exports = router;
