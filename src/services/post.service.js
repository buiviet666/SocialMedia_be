const Post = require('../models/Post.model');

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

    async getAllPost() {
        return await Post.find()
        .populate('userId', 'userName avatar')
        .sort({createdAt: -1});
    };

    // lay thong tin bai viet cua nguoi dung
    async getPostByUser(userId) {
        return await Post.find({
            userId
        })
        .populate('userId', 'userName avatar')
        .sort({createdAt: -1});
    };

    // lay thong tin bai viet
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
}

module.exports = new PostService();