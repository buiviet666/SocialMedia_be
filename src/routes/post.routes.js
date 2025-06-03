const express = require('express');
const router = express.Router();
const {protect} = require('../services/jwt.service');
const upload = require('../middlewares/upload.middleware');
const postController = require('../controllers/post.controller');

router.post('/', protect, upload.array('media', 5), postController.createPost);
router.get('/privacy/:type', protect, postController.getPostsByPrivacy);
router.put('/:id', protect, upload.array('media', 5), postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.get('/me', protect, postController.getMyPosts);
router.post('/toggle-like', protect, postController.toggleLikePost);
router.post('/toggle-save', protect, postController.toggleSavePost);
router.get('/liked-posts', protect, postController.getLikedPosts);
router.get('/saved-posts', protect, postController.getSavedPosts);
router.get('/friend-posts', protect, postController.getFriendPosts);
router.get('/:id', protect, postController.getPostDetail);
router.get('/user/:userId', protect, postController.getPostsByUserId);
router.get('/:id/likes', protect, postController.getPostLikes);

module.exports = router;
