const MessageService = require("../services/message.service");
const { getIO } = require("../sockets/socket");

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { conversationId, content, type = "TEXT" } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        statusCode: 400,
        message: "conversationId and content are required"
      });
    }

    const message = await MessageService.sendMessage({
      conversationId,
      senderId,
      content,
      type
    });

    // Emit real-time message to other participants
    const io = getIO();
    const recipients = message.conversationId.participants.filter(
      (user) => user._id.toString() !== senderId.toString()
    );

    recipients.forEach((user) => {
      io.to(user._id.toString()).emit("receive_message", message);
    });

    res.status(201).json({
      statusCode: 201,
      message: "Message sent successfully!",
      data: message // ✅ trả về 1 object
    });
  } catch (error) {
    next(error);
  }
};

// update a message
exports.updateMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        statusCode: 400,
        message: "Content is required to update message"
      });
    }

    const message = await MessageService.updateMessage(messageId, userId, content);

    if (message === "unauthorized") {
      return res.status(403).json({
        statusCode: 403,
        message: "You can only edit your own message"
      });
    }

    if (!message) {
      return res.status(404).json({
        statusCode: 404,
        message: "Message not found"
      });
    }

    // ✅ Emit real-time: notify all except sender
    const io = getIO();
    const conversation = message.conversationId;
    const recipients = conversation.participants.filter(
      (p) => p.toString() !== userId.toString()
    );
    recipients.forEach((receiverId) => {
      io.to(receiverId.toString()).emit("message_edited", {
        messageId: message._id,
        conversationId: conversation._id,
        content: message.content,
        status: message.status,
        updatedAt: message.updatedAt
      });
    });

    res.status(200).json({
      statusCode: 200,
      message: "Message updated successfully!",
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.id;

    const message = await MessageService.deleteMessage(messageId, userId);

    if (message === "unauthorized") {
      return res.status(403).json({
        statusCode: 403,
        message: "You can only delete your own message"
      });
    }

    if (!message) {
      return res.status(404).json({
        statusCode: 404,
        message: "Message not found"
      });
    }

    // ✅ Emit real-time: notify other participants (nếu dùng socket)
    const io = getIO();
    const recipients = message.conversationId.participants.filter(
      (p) => p.toString() !== userId.toString()
    );

    recipients.forEach((receiverId) => {
      io.to(receiverId.toString()).emit("message_deleted", {
        messageId: message._id,
        conversationId: message.conversationId._id
      });
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Message deleted successfully!",
      data: message._id
    });
  } catch (error) {
    next(error);
  }
};

// mark as read
exports.markAsDelivered = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await MessageService.markAsDelivered(messageId, userId);

    if (!message) {
      return res.status(404).json({
        statusCode: 404,
        message: "Message not found"
      });
    }

    // ✅ Emit real-time: notify sender
    const io = getIO();
    const senderId =
      (message.senderId && message.senderId._id) || message.senderId || null;

    if (senderId && senderId.toString() !== userId.toString()) {
      io.to(senderId.toString()).emit("message_delivered", {
        messageId: message._id,
        deliveredBy: userId
      });
    }


    if (senderId.toString() !== userId.toString()) {
      io.to(senderId.toString()).emit("message_delivered", {
        messageId: message._id,
        deliveredBy: userId
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Message marked as delivered",
      data: message._id
    });
  } catch (error) {
    next(error);
  }
};

// mark as deliver
exports.markAsRead = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await MessageService.markAsRead(messageId, userId);

    if (!message) {
      return res.status(404).json({
        statusCode: 404,
        message: "Message not found"
      });
    }

    const io = getIO();
    const senderId =
      (message.senderId && message.senderId._id) || message.senderId || null;

    if (senderId && senderId.toString() !== userId.toString()) {
      io.to(senderId.toString()).emit("message_read", {
        messageId: message._id,
        readBy: userId
      });
    }


    if (senderId.toString() !== userId.toString()) {
      io.to(senderId.toString()).emit("message_read", {
        messageId: message._id,
        readBy: userId
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Message marked as read",
      data: message._id
    });
  } catch (error) {
    next(error);
  }
};

//get messages by conversation
exports.getMessagesByConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await MessageService.getMessagesByConversation(conversationId);

    res.status(200).json({
      statusCode: 200,
      message: "Messages fetched successfully!",
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.markDeliveredBulk = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "Thiếu hoặc sai định dạng messageIds" });
    }

    await MessageService.markDeliveredBulk(messageIds, userId);

    res.status(200).json({
      statusCode: 200,
      message: "Đã đánh dấu đã nhận cho các tin nhắn",
    });
  } catch (err) {
    next(err);
  }
};

exports.markReadBulk = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "Thiếu hoặc sai định dạng messageIds" });
    }

    await MessageService.markReadBulk(messageIds, userId);

    res.status(200).json({
      statusCode: 200,
      message: "Đã đánh dấu đã đọc cho các tin nhắn",
    });
  } catch (err) {
    next(err);
  }
};