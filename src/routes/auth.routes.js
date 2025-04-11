const express = require('express');
const router = express.Router();
const validate = require('../validations/user.validation');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const {protect} = require('../services/jwt.service');

// Public routes
router.post('/register', validate.register, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/profile', userController.getProfile);

// email
router.post('/send-verification-email', protect, authController.sendVerificationEmail);
router.get('/verify-email', authController.verifyEmail);

// forgot
router.post('/send-forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
