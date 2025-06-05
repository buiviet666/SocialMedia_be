const express = require("express");
const router = express.Router();
const { protect } = require('../services/jwt.service');
const ConversationController = require("../controllers/conversation.controller");

router.get("/", protect, ConversationController.getAllConversations);
router.get("/:id", protect, ConversationController.getConversationById);
router.delete("/:id", protect, ConversationController.deleteConversation);
router.post("/", protect, ConversationController.createConversation);


module.exports = router;
