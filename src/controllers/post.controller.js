const postService = require('../services/post.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.helper');

exports.createPost = async (req, res, next) => {
    try {
        const photoData = [];

        for (const file of req.files || []) {
            const result = await uploadToCloudinary(file.buffer, 'posts');
            photoData.push({url: result.url, publicId: result.publicId });
        };

        const post = await postService.createPost(req.user._id, req.body, photoData);

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

exports.getPosts = async (req, res, next) => {
    try {
        const posts = await postService.getAllPostPublic();
        res.json({success: true, data: posts});
    } catch (error) {
        next(error);
    }
};

exports.getPostByUserId = async (req, res, next) => {
    try {
        const {userId} = req.parmas;
        const posts = await postService.getPostByUserId(userId);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

exports.getPostById = async (req, res, next) => {
    try {
        const postList = await postService.getPostById(req.params.id);
        if (!postList) return res.status(404).json({message: "Bài viết không tồn tại"});

        res.json({success: true, data: postList});
    } catch (error) {
        next(next);
    }
};

exports.updatePost = async (req, res, next) => {
    try {
      const post = await postService.updatePost(req.params.id, req.user._id, req.body);
      if (!post) return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
  
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const deleted = await postService.deletePost(req.params.id, req.user._id);
        if (!deleted) return res.status(403).json({ message: 'Không có quyền xóa' });

        for (const photo of deleted.photoUrls || []) {
            await deleteFromCloudinary(photo.publicId);
        }

        res.json({success: true, message: 'Đã xóa bài viết thành công'});
    } catch (error) {
        next(error);
    }
}

exports.likePost = async (req, res, next) => {
    try {
        const { postId } = req.body;
        const userId = req.user._id;

        const result = await postService.toggleLike(postId, userId);
        if (!result) return res.status(404).json({message: 'Không tìm thấy bài viết'});

        res.json({
            success: true,
            message: result.liked ? 'Like' : 'unLike',
            data: result
        });
    } catch (error) {
        next(next);
    }
};

exports.savePost = async (req, res, next) => {
    try {
        const {postId} = req.body;
        if (!postId) return res.status(400).json({ message: 'postId là bắt buộc' });

        const result = await postService.toggleSave(req.user._id, postId);

        res.json({
            success: true,
            message: result.saved ? 'Save' : 'unSave',
        });
    } catch (error) {
        next(error);
    }
}

exports.getAllPostSaved = async (req, res, next) => {
    try {
        const posts = await postService.getAllSavedPosts(req.user._id);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        next(error);
    }
}

exports.getAllPostLiked = async (req, res, next) => {
    try {
        const posts = await postService.getAllLikedPost(req.user._id);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        next(error);
    }
};