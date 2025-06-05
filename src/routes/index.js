const express = require("express");
const routerUser = require('./user.routes');
const routerAuth = require('./auth.routes');
const routerComment = require("./comment.routes");
const routerPost = require("./post.routes");
const routerReport = require('./report.routes');
const routerShare = require('./share.routes');
const routerConversation = require('./conversation.routes');
const routerMessage = require("./message.routes");
const router = express.Router();

router.use("/users", routerUser);
router.use("/auth", routerAuth);
router.use("/comments", routerComment);
router.use("/posts", routerPost);
router.use('/reports', routerReport);
router.use('/shares', routerShare);
router.use('/conversations', routerConversation);
router.use("/messages", routerMessage);


module.exports = router;