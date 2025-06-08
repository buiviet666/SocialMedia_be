const express = require("express");
const router = express.Router();
const { protect } = require('../services/jwt.service');
const MessageController = require("../controllers/message.controller");

router.post("/", protect, MessageController.sendMessage);
router.put("/:id", protect, MessageController.updateMessage);
router.delete("/:id", protect, MessageController.deleteMessage);
router.post("/:id/read", protect, MessageController.markAsRead);
router.post("/:id/delivered", protect, MessageController.markAsDelivered);
router.get("/conversation/:conversationId", protect, MessageController.getMessagesByConversation);
router.post('/mark-delivered-bulk', protect, MessageController.markDeliveredBulk);
router.post('/mark-read-bulk', protect, MessageController.markReadBulk);


module.exports = router;
