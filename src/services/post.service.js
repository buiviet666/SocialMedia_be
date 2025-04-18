const Post = require('../models/Post.model');
const User = require('../models/User.model');

class PostService {
    async createPost(userId, postData, photoData) {
        const newPost = new Post({
            ...postData,
            userId,
            photoUrls: photoData
        });
        await newPost.save();
        return newPost;
    };

    async getAllPostPublic() {
        return await Post.find({privacy: "PUBLIC"})
        .populate('userId', 'userName avatar')
        .sort({createdAt: -1});
    };

    async getPostByUserId(userId) {
        return await Post.find({
            userId
        })
        .populate('userId', 'userName avatar')
        .sort({createdAt: -1});
    };

    async getPostById(postId) {
        return await Post.findById(postId)
        .populate('userId', 'userName avatar')
    };

    async updatePost(postId, userId, updataData) {
        const post = await Post.findOneAndUpdate(
            {_id: postId, userId},
            {...updataData, isEdited: true},
            {new: true}
        );
        return post;
    };

    async deletePost(postId, userId) {
        return await Post.findOneAndDelete({
            _id: postId,
            userId
        });
    };

    async toggleLike(postId, userId) {
        const post = await Post.findById(postId);
        if (!post) return null;

        const index = post.likes.indexOf(userId);
        let liked = false;

        if (index !== -1) {
            post.likes.splice(index, 1);
        } else {
            post.likes.push(userId);
            liked = true;
        }

        await post.save();
        return {
            liked,
            totalLikes: post.likes.length
        }
    };

    async toggleSave(userId, postId) {
        const user = await User.findById(userId);
        if (!user) return null;

        const index = user.savedPosts.indexOf(postId);

        if (index === -1) {
            user.savedPosts.push(postId);
            await user.save();
            return {saved: true};
        } else {
            user.savedPosts.splice(index, 1);
            await user.save();
            return {saved: false};
        }
    }

    async getAllSavedPosts(userId) {
        const user = await User.findById(userId)
        .populate({
          path: 'savedPosts',
          populate: {path: 'userId', select: 'userName avatar'}
        });
    
        if (!user) throw new Error('Người dùng không tồn tại');
        return user.savedPosts;
    }

    async getAllLikedPost(userId) {
        const user = await User.findById(userId)
        .populate({
            path: 'likedPosts',
            populate: {path: 'userId', select: 'userName avatar'}
        });

        if (!user) throw new Error('Người dùng không tồn tại');

        return user.likedPost;
    }
};

module.exports = new PostService();