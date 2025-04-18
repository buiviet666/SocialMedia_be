const express = require('express');
const router = express.Router();
const {protect} = require('../services/jwt.service');
const upload = require('../middlewares/upload.middleware');
const postController = require('../controllers/post.controller');

router.post('/creat-post', protect, upload.array('media', 5), postController.createPost);
router.get('/all-post', protect, postController.getPosts);
router.get('/:id', protect, postController.getPostById);
router.put('/:id', protect, postController.updatePost);
router.delete('/delete/:id', protect, postController.deletePost);

module.exports = router;
