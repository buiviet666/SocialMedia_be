const postService = require('../services/post.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.helper');

exports.createPost = async (req, res, next) => {
    try {
        const photoData = [];

        for (const file of req.files || []) {
            const result = await uploadToCloudinary(file.path, 'posts');
            photoData.push({url: result.secure_url, publicId: result.public_id});
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
        const posts = await postService.getAllPost();
        res.json({success: true, data: posts});
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