const express = require('express');
const router = express.Router();
const validate = require('../validations/user.validation');
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/register', validate.register, authController.register);
router.post('/login', validate.login, authController.login);

module.exports = router;
