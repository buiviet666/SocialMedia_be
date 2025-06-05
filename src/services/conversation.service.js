const Conversation = require("../models/Conversation.model");
const Message = require("../models/Message.model");

class ConversationService {
    async getConversationsByUser(userId) {
        const conversations = await Conversation.find({
            participants: userId
        })
        .populate({
            path: "participants",
            select: "_id userName nameDisplay avatar isOnline"
        })
        .populate({
            path: "lastMessage",
            select: "_id content type status createdAt senderId seenBy",
            populate: {
            path: "senderId",
            select: "_id userName nameDisplay avatar"
            }
        })
        .sort({ updatedAt: -1 });

        const result = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                senderId: { $ne: userId },
                seenBy: { $ne: userId }
            });

            return {
                _id: conv._id,
                isGroup: conv.isGroup,
                updatedAt: conv.updatedAt,
                participants: conv.participants,
                lastMessage: conv.lastMessage,
                unreadCount
            };
        }));
        return result;
    }

    async getConversationById(conversationId, userId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId // chỉ lấy nếu người dùng tham gia
        })
        .populate({
            path: "participants",
            select: "_id userName nameDisplay avatar isOnline"
        })
        .populate({
            path: "lastMessage",
            select: "_id content type status createdAt senderId seenBy",
            populate: {
            path: "senderId",
            select: "_id userName nameDisplay avatar"
            }
        });
        return conversation;
    }

    async deleteConversationHard(conversationId, userId) {
        const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
        });

        if (!conversation) return null;

        // Xóa tất cả tin nhắn trong cuộc trò chuyện
        await Message.deleteMany({ conversationId: conversation._id });

        // Xóa luôn conversation
        await Conversation.deleteOne({ _id: conversation._id });

        return conversation._id;
    }

    async createOneToOneConversation(userId, partnerId) {
        if (!userId || !partnerId || userId === partnerId) {
        throw new Error("Invalid participants");
        }

        const participants = [userId.toString(), partnerId.toString()].sort();

        const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
        });

        if (existing) return existing;

        const conversation = new Conversation({
        participants,
        isGroup: false
        });

        await conversation.save();
        return conversation.populate("participants", "_id userName nameDisplay avatar isOnline");
    }
}

module.exports = new ConversationService();
