const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../validations/user.validation');

// Protected routes (require authentication)
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validate.updateProfile, userController.updateProfile);
router.put('/socket', userController.updateSocketId);

module.exports = router;