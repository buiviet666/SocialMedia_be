const Notification = require('../models/Notification.model');
const { getIO } = require('../sockets/socket');

const sendNotification = async ({
  receiverId,
  senderId,
  type,
  postId,
  message,
  redirectUrl,
  extraData
}) => {
  if (!receiverId || !senderId || !type) {
    console.error('Thiếu dữ liệu cần thiết để gửi thông báo');
    return;
  }

  // Tạo mới thông báo
  const notification = await Notification.create({
    receiverId,
    senderId,
    type,
    postId,
    message,
    redirectUrl,
    extraData
  });

  // Gửi socket tới người nhận
  const io = getIO();
  io.to(receiverId.toString()).emit('new_notification', notification);

  // Emit lại số lượng chưa đọc
  const unreadCount = await Notification.countDocuments({
    receiverId,
    isRead: false
  });

  io.to(receiverId.toString()).emit('notification_count', { unreadCount });

  return notification;
};

module.exports = sendNotification;
