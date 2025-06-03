const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../validations/user.validation');
const authController = require('../controllers/auth.controller');
const upload = require('../middlewares/upload.middleware');
const {protect} = require('../services/jwt.service');


// Protected routes (require authentication)
// router.use(authMiddleware);

// trang ca nhan
router.put('/me', protect, userController.updateCurrentUserProfile);
router.patch('/change-password', protect, userController.changePassword);
router.patch('/change-email', protect, userController.changeEmail);
router.patch('/avatar', protect, upload.single('avatar'), userController.updateAvatar);
router.post('/:id/follow', protect, userController.followUser);
router.delete('/:id/unfollow', protect, userController.unfollowUser);
router.post('/:id/block', protect, userController.blockUser);
router.delete('/:id/unblock', protect, userController.unblockUser);
router.get('/blocked', protect, userController.getBlockedUsers);
router.get('/recommendations', protect, userController.getFriendRecommendations);
router.delete('/me', protect, userController.deleteOwnAccount);
router.post('/bulk', protect, userController.getUsersByIds);

router.get('/:id', userController.getUserProfile);
router.put('/socket', userController.updateSocketId);

module.exports = router;