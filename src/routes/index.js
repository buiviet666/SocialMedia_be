const express = require("express");
const routerUser = require('../routes/user.rotes');
const routerAuth = require('../routes/auth.routes');
const router = express.Router();

// viet duong dan o day
router.use("/users", routerUser);
router.use("/auth", routerAuth);

module.exports = router;