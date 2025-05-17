const express = require('express');
const router = express.Router();
const validate = require('../validations/user.validation');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const {protect} = require('../services/jwt.service');

// Public routes
router.post('/register', validate.register, authController.register); // done
router.post('/login', validate.login, authController.login); // done
router.post('/logout', authController.logout); // donne
router.post('/resetAccessToken', authController.resetAccessToken); // done
router.get('/profile', userController.getProfile); // check lại

// email
router.post('/send-verification-email', protect, authController.sendVerificationEmail); // done
router.get('/verify-email', authController.verifyEmail); // done

// forgot
router.post('/send-forgot-password', authController.forgotPassword); // done
router.post('/reset-password', authController.resetPassword); // done

module.exports = router;
