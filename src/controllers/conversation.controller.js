const ConversationService = require('../services/conversation.service');
const { getIO } = require("../sockets/socket");

// get list conversation
exports.getAllConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await ConversationService.getConversationsByUser(userId);

    res.status(200).json({
      statusCode: 200,
      message: "Get all conversations successfully!",
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// get detail conversation by id
exports.getConversationById = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id;
    const conversation = await ConversationService.getConversationById(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        statusCode: 404,
        message: "Conversation not found or access denied"
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Get conversation successfully!",
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// delete conversation
exports.deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;
    const deletedId = await ConversationService.deleteConversationHard(conversationId, userId);
    if (!deletedId) {
      return res.status(404).json({
        statusCode: 404,
        message: "Conversation not found or access denied"
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Conversation deleted permanently",
      data: deletedId
    });
  } catch (error) {
    next(error);
  }
};

// create conversation
exports.createConversation = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({
        statusCode: 400,
        message: "partnerId is required"
      });
    }

    const conversation = await ConversationService.createOneToOneConversation(userId, partnerId);

    // ✅ Emit real-time: notify partner if new conversation
    if (conversation.participants.length === 2) {
      const io = getIO();
      const partnerOnly = conversation.participants.find(
        (p) => p._id.toString() !== userId
      );

      io.to(partnerOnly._id.toString()).emit("new_conversation", {
        conversation
      });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Conversation created successfully!",
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};
