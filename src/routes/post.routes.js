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

// lay tat ca cac bai viet public
// router.get('/', protect, postController.getPosts);

// lay tat ca bai viet cua user voi idUser
// router.get('/:userId', protect, postController.getPostByUserId);

// lay thong tin bai viet voi idPost
// router.get('/:id', protect, postController.getPostById);

// chinh sua bai viet
// router.put('/:id', protect, postController.updatePost);

// xoa bai viet
// router.delete('/:id', protect, postController.deletePost);

// lay tat ca bai viet da luu, da thich
// router.get('/saved-posts', protect, postController.getAllPostSaved);
// router.get('/liked-posts', protect, postController.getAllPostLiked);

// interaction
// router.post('/toggle-like', protect, postController.likePost);
// router.post('/toggle-save', protect, postController.savePost);

// utilities


module.exports = router;
