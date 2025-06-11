const notificationService = require('../services/notification.service');

// 1. Tạo thông báo mới
exports.createNotification = async (req, res, next) => {
  try {
    const {
      receiverId,
      senderId,
      type,
      postId,
      message,
      redirectUrl,
      extraData
    } = req.body;

    // Kiểm tra các trường quan trọng
    if (!receiverId || !senderId || !type) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Thiếu dữ liệu bắt buộc (receiverId, senderId, type)',
      });
    }

    const notification = await notificationService.createNotification({
      receiverId,
      senderId,
      type,
      postId,
      message,
      redirectUrl,
      extraData
    });

    res.status(201).json({
      statusCode: 201,
      message: 'Tạo thông báo thành công!',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách thông báo của người dùng
exports.getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAllNotifications(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Lấy danh sách thông báo thành công!',
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// 3. Đánh dấu một thông báo là đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: 'Đã đánh dấu đã đọc!',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// 4. Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc!'
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xóa một thông báo
exports.deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: 'Xóa thông báo thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// 6. Xóa tất cả thông báo
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    await notificationService.deleteAllNotifications(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Đã xóa tất cả thông báo thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// 7. Đếm số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Lấy số lượng thông báo chưa đọc thành công!',
      data: count
    });
  } catch (error) {
    next(error);
  }
};
