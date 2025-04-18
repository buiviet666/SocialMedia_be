const express = require("express");
const routerUser = require('../routes/user.rotes');
const routerAuth = require('../routes/auth.routes');
const routerComment = require("./comment.routes");
const routerPost = require("./post.routes");
const router = express.Router();

router.use("/users", routerUser);
router.use("/auth", routerAuth);
router.use("/comments", routerComment);
router.use("/posts", routerPost);

module.exports = router;