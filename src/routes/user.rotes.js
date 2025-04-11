const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../validations/user.validation');
const authController = require('../controllers/auth.controller');

// Protected routes (require authentication)
router.use(authMiddleware);

// trang ca nhan
router.delete('/profile', userController.deleteProfile);
router.put('/profile', validate.updateProfile, userController.updateProfile);
router.put('/socket', userController.updateSocketId);
router.post('/change-password', authController.changePassword);

module.exports = router;