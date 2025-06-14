const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model");

class MessageService {
    async sendMessage({ conversationId, senderId, content, type }) {
        const message = await Message.create({
            conversationId,
            senderId,
            content,
            type
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date()
        });

        return await Message.findById(message._id)
        .populate("senderId", "_id userName nameDisplay avatar")
        .populate({
            path: "conversationId",
            select: "_id participants",
            populate: {
            path: "participants",
            select: "_id userName nameDisplay avatar"
            }
        });
    }

    // async updateMessage(messageId, userId, newContent) {
    //     const message = await Message.findById(messageId)
    //     .populate("conversationId", "_id participants");
    //     if (!message) return null;
    //     if (message.senderId.toString() !== userId.toString()) return "unauthorized";
    //     message.content = newContent;
    //     message.status = "EDITED";
    //     message.updatedAt = new Date();
    //     await message.save();
    //     return await message.populate("senderId", "_id userName nameDisplay avatar");
    // }

    async updateMessage(messageId, userId, newContent) {
        const message = await Message.findById(messageId).populate("conversationId", "_id participants");
        if (!message) return null;

        message.content = newContent;
        message.status = "EDITED";
        message.updatedAt = new Date();
        await message.save();

        return await message.populate("senderId", "_id userName nameDisplay avatar");
    }


    // async deleteMessage(messageId, userId) {
    //     const message = await Message.findById(messageId).populate({
    //         path: "conversationId",
    //         select: "_id participants"
    //     });
    //     if (!message) return null;
    //     if (message.senderId.toString() !== userId.toString()) {
    //         return "unauthorized";
    //     }
    //     await Message.deleteOne({ _id: messageId });
    //     return message;
    // }

    async deleteMessage(messageId, userId) {
        const message = await Message.findById(messageId).populate({
            path: "conversationId",
            select: "_id participants"
        });
        if (!message) return null;

        await Message.deleteOne({ _id: messageId });
        return message;
    }

    async markAsRead(messageId, userId) {
        const message = await Message.findById(messageId).populate("senderId", "_id");
        if (!message) return null;

        if (!message.seenBy.includes(userId)) {
            message.seenBy.push(userId);
            message.updatedAt = new Date();
            await message.save();
        }
        return message._id;
    }

    async markAsDelivered(messageId, userId) {
        const message = await Message.findById(messageId).populate("senderId", "_id");
        if (!message) return null;
        if (!message.deliveredTo.includes(userId)) {
            message.deliveredTo.push(userId);
            message.updatedAt = new Date();
            await message.save();
        }
        return message._id;
    }

    async getMessagesByConversation(conversationId) {
        return await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .populate("senderId", "_id nameDisplay avatar");
    }

    async markDeliveredBulk(messageIds, userId) {
        await Message.updateMany(
        {
            _id: { $in: messageIds },
            deliveredTo: { $ne: userId },
        },
        {
            $addToSet: { deliveredTo: userId },
        }
        );
    }

    async markReadBulk(messageIds, userId) {
        await Message.updateMany(
        {
            _id: { $in: messageIds },
            seenBy: { $ne: userId },
        },
        {
            $addToSet: { seenBy: userId },
        }
        );
    }
}

module.exports = new MessageService();
