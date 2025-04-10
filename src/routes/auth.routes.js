const express = require('express');
const router = express.Router();
const validate = require('../validations/user.validation');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

// Public routes
router.post('/register', validate.register, authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', userController.getProfile);

module.exports = router;
