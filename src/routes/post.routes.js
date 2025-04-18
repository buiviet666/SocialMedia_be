const express = require('express');
const router = express.Router();
const {protect} = require('../services/jwt.service');
const upload = require('../middlewares/upload.middleware');
const postController = require('../controllers/post.controller');

// tao bai viet
router.post('/', protect, upload.array('media', 5), postController.createPost);

// lay tat ca cac bai viet public
router.get('/', protect, postController.getPosts);

// lay tat ca bai viet cua user voi idUser
router.get('/:userId', protect, postController.getPostByUserId);

// lay thong tin bai viet voi idPost
router.get('/:id', protect, postController.getPostById);

// chinh sua bai viet
router.put('/:id', protect, postController.updatePost);

// xoa bai viet
router.delete('/:id', protect, postController.deletePost);

// lay tat ca bai viet da luu, da thich
router.get('/saved-posts', protect, postController.getAllPostSaved);
router.get('/liked-posts', protect, postController.getAllPostLiked);

// interaction
router.post('/toggle-like', protect, postController.likePost);
router.post('/toggle-save', protect, postController.savePost);

// utilities


module.exports = router;
