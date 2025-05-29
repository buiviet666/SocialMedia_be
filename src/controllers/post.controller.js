const postService = require('../services/post.service');
const AppError = require('../utils/appError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.helper');

// create post
exports.createPost = async (req, res, next) => {
    try {
        const photoData = [];

        for (const file of req.files || []) {
            const result = await uploadToCloudinary(file.buffer, 'posts');
            photoData.push({ url: result.url, publicId: result.publicId });
        }

        let visibilitySetting;
        if (req.body.visibilitySetting) {
            visibilitySetting = JSON.parse(req.body.visibilitySetting);
        }

        await postService.createPost(req.user._id, {
            ...req.body,
            visibilitySetting
        }, photoData);

        res.status(201).json({
            statusCode: 201,
            message: "New post created successfully!"
        });
    } catch (error) {
        next(error);
    }
};

// get post by privacy
exports.getPostsByPrivacy = async (req, res, next) => {
  try {
    const { type } = req.params;
    const currentUserId = req.user._id;

    const posts = await postService.getPostsByPrivacy(type, currentUserId);

    res.json({
      statusCode: 201,
      message: "Get article successfully!",
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// update post
exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const photoData = [];
    for (const file of req.files || []) {
      const result = await uploadToCloudinary(file.buffer, 'posts');
      photoData.push({ url: result.url, publicId: result.publicId });
    }

    const updatedPost = await postService.updatePost(postId, userId, req.body, photoData);

    if (!updatedPost) {
        throw new AppError('No edit permission or article does not exist', 403);
    }

    res.json({ 
        statusCode: 201,
        message: 'Update article successfully!',
        data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// delete post
exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const deletedPost = await postService.deletePost(postId, userId);

    if (!deletedPost) {
        throw new AppError('No permission to delete or post does not exist', 403);
    }

    for (const photo of deletedPost.photoUrls || []) {
      await deleteFromCloudinary(photo.publicId);
    }

    res.json({ 
        statusCode: 201, 
        message: 'Post deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// get profile all posts
exports.getMyPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const posts = await postService.getPostByUserId(userId);

    res.json({
      statusCode: 201,
      message: 'Get list of successful posts!',
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// toggle like post
exports.toggleLikePost = async (req, res, next) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    if (!postId) {
        throw new AppError('PostId is required', 403);
    }

    const result = await postService.toggleLike(postId, userId);

    if (!result) {
        throw new AppError('No posts found', 403);
    }

    res.json({
      statusCode: 201,
      message: result.liked ? 'Like' : 'unLike',
      totalLikes: result.totalLikes
    });
  } catch (error) {
    next(error);
  }
};

// toggle save post
exports.toggleSavePost = async (req, res, next) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    if (!postId) {
        throw new AppError('PostId is required', 403);
    }

    const result = await postService.toggleSave(postId, userId);

    if (!result) {
        throw new AppError('No posts found', 403);
    }

    res.json({
      statusCode: 201,
      message: result.saved ? 'Save' : 'unSave'
    });
  } catch (error) {
    next(error);
  }
};

// get all liked posts
exports.getLikedPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const posts = await postService.getLikedPosts(userId);

    res.json({
      statusCode: 201,
      message: 'Get liked posts successfully!',
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// get all saved posts
exports.getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const posts = await postService.getSavedPosts(userId);

    res.json({
      statusCode: 201,
      message: 'Get saved posts successfully!',
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// get all post from friends following
exports.getFriendPosts = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const posts = await postService.getPostsFromFriends(currentUserId);

    res.json({ 
      statusCode: 201, 
      message: 'Get posts from friends successfully!',
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// get detail post
exports.getPostDetail = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user._id;

    const post = await postService.getPostDetail(postId, currentUserId);
    
    if (!post) {
        throw new AppError('No posts found', 403);
    }

    res.json({ 
      statusCode: 201,
      message: 'Get detail data post successfully!',
      data: post 
    });
  } catch (error) {
    next(error);
  }
};

// get post by id
exports.getPostsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const posts = await postService.getPostsByUserId(userId, currentUserId);

    res.json({
      statusCode: 201,
      message: 'Get posts successfully!',
      data: posts 
    });
  } catch (error) {
    next(error);
  }
};
