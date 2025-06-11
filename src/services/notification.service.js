const Notification = require('../models/Notification.model');
const { getIO } = require('../sockets/socket');

class NotificationService {
  async createNotification({ receiverId, senderId, type, postId, message, redirectUrl, extraData }) {
    const notification = await Notification.create({
      receiverId,
      senderId,
      type,
      postId,
      message,
      redirectUrl,
      extraData
    });
    const io = getIO();
    io.to(receiverId.toString()).emit('new_notification', notification);

    const unreadCount = await Notification.countDocuments({ receiverId, isRead: false });
    io.to(receiverId.toString()).emit('notification_count', { unreadCount });
    return notification;
  }

  async getAllNotifications(userId) {
    return await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId) {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (notification) {
      const io = getIO();
      io.to(notification.receiverId.toString()).emit('notification_read', {
        notificationId: notification._id
      });

      const unreadCount = await Notification.countDocuments({
        receiverId: notification.receiverId,
        isRead: false
      });
      io.to(notification.receiverId.toString()).emit('notification_count', { unreadCount });
    }

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany({ receiverId: userId, isRead: false }, { isRead: true });

    const io = getIO();
    io.to(userId.toString()).emit('notifications_all_read');
    io.to(userId.toString()).emit('notification_count', { unreadCount: 0 });
  }

  async deleteNotification(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new AppError('Not found notification', 404);
    }
    await Notification.findByIdAndDelete(notificationId);
    const io = getIO();
    io.to(notification.receiverId.toString()).emit('notification_deleted', {
      notificationId
    });
    const unreadCount = await Notification.countDocuments({
      receiverId: notification.receiverId,
      isRead: false
    });
    io.to(notification.receiverId.toString()).emit('notification_count', { unreadCount });
  }

  async deleteAllNotifications(userId) {
    await Notification.deleteMany({ receiverId: userId });
    const io = getIO();
    io.to(userId.toString()).emit('notifications_all_deleted');
    io.to(userId.toString()).emit('notification_count', { unreadCount: 0 });
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ receiverId: userId, isRead: false });
  }
}

module.exports = new NotificationService();
