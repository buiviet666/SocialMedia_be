const Post = require('../models/Post.model');
const User = require('../models/User.model');
const AppError = require('../utils/appError');
const sendNotification = require("../utils/sendNotification");
const { getIO } = require('../sockets/socket');

class PostService {
    async createPost(userId, postData, photoData) {
        const {
            privacy = 'PUBLIC',
            visibilitySetting,
            ...restData
        } = postData;

        const newPost = new Post({
            ...restData,
            privacy,
            visibilitySetting: ['FRIENDONLY', 'EXCEPTFRIEND'].includes(privacy) ? visibilitySetting : undefined,
            userId,
            photoUrls: photoData
        });

        await newPost.save();
    }

    async getPostsByPrivacy(type, currentUserId) {
        switch (type) {
            case 'PUBLIC':
                return await Post.find({
                    $or: [
                        { privacy: 'PUBLIC' },
                        { userId: currentUserId }
                    ]
                })
                .populate('userId', 'userName avatar nameDisplay')
                .sort({ createdAt: -1 });

            case 'FRIENDS':
            const currentUser = await User.findById(currentUserId).select('following');
            const friendIds = currentUser.following;
            return await Post.find({
                privacy: 'FRIENDS',
                userId: { $in: friendIds }
            })
            .populate('userId', 'userName avatar')
            .sort({ createdAt: -1 });

            case 'FRIENDONLY':
            return await Post.find({
                privacy: 'FRIENDONLY',
                'visibilitySetting.type': 'ALLOWED',
                'visibilitySetting.userIds': currentUserId
            })
            .populate('userId', 'userName avatar')
            .sort({ createdAt: -1 });

            case 'EXCEPTFRIEND':
            return await Post.find({
                privacy: 'EXCEPTFRIEND',
                'visibilitySetting.type': 'EXCLUDED',
                'visibilitySetting.userIds': { $ne: currentUserId }
            })
            .populate('userId', 'userName avatar')
            .sort({ createdAt: -1 });

            case 'PRIVATE':
            return await Post.find({
                privacy: 'PRIVATE',
                userId: currentUserId
            })
            .populate('userId', 'userName avatar')
            .sort({ createdAt: -1 });

            default:
            return [];
        }
    }

    async updatePost(postId, userId, updateData, newPhotos) {
        const post = await Post.findOne({ _id: postId, userId });
        if (!post) {
            throw new AppError('Article does not exist', 400);
        }
        if (newPhotos && newPhotos.length > 0) {
            post.photoUrls.push(...newPhotos);
        }
        post.title = updateData.title || post.title;
        post.content = updateData.content || post.content;
        post.privacy = updateData.privacy || post.privacy;
        post.location = updateData.location || post.location;
        post.isEdited = true;
        if (
            updateData.privacy === 'FRIENDONLY' ||
            updateData.privacy === 'EXCEPTFRIEND'
        ) {
            post.visibilitySetting = {
            type: updateData.visibilitySetting?.type,
            userIds: updateData.visibilitySetting?.userIds || [],
            };
        } else {
            post.visibilitySetting = undefined;
        }

        await post.save();
        return post;
    }

    async getPostByUserId(userId) {
        return await Post.find({
            userId
        })
        .populate('userId', 'userName avatar')
        .sort({createdAt: -1});
    };

    async getAllPostPublic() {
        return await Post.find({privacy: "PUBLIC"})
        .populate('userId', 'userName avatar')
        .sort({createdAt: -1});
    };

    async toggleLike(postId, userId) {
        const post = await Post.findById(postId).populate("userId", "_id userName nameDisplay avatar");
        const user = await User.findById(userId);
        if (!post) {
            throw new AppError('Article does not exist', 400);
        }
        const index = post.likes.indexOf(userId);
        let liked = false;
        if (index === -1) {
            post.likes.push(userId);
            liked = true;

            // sent notification
            if (post.userId._id.toString() !== userId.toString()) {
            await sendNotification({
                type: "LIKE",
                senderId: userId,
                receiverId: post.userId._id,
                postId,
                message: `${user.nameDisplay || user.userName} has like your post!`,
                redirectUrl: `/posts/${postId}`
            });
            }

            const io = getIO();
            io.to(post.userId._id.toString()).emit("post_liked", {
                postId,
                likedBy: userId
            });
        } else {
            post.likes.splice(index, 1);
        }
        await post.save();
        return {
            liked,
            totalLikes: post.likes.length
        };
    }

    async toggleSave(postId, userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const index = user.savedPosts.indexOf(postId);
        let saved = false;
        if (index === -1) {
            user.savedPosts.push(postId);
            saved = true;
        } else {
            user.savedPosts.splice(index, 1);
        }
        await user.save();
        return { saved };
    }

    async deletePost(postId, userId) {
        return await Post.findOneAndDelete({
            _id: postId,
            userId
        });
    };

    async getLikedPosts(userId) {
        const posts = await Post.find({ likes: userId })
            .populate('userId', 'userName avatar')
            .sort({ createdAt: -1 });
        return posts;
    };

    async getSavedPosts(userId) {
        const user = await User.findById(userId)
        .populate({
            path: 'savedPosts',
            populate: {
                path: 'userId',
                select: 'userName avatar'
            }
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user.savedPosts;
    };

    async getPostsFromFriends(userId) {
        const user = await User.findById(userId).select('following');
        const followingIds = user.following;

        const posts = await Post.find({
            userId: { $in: followingIds },
            privacy: { $in: ['FRIENDS', 'FRIENDONLY', 'EXCEPTFRIEND'] }
        })
        .populate('userId', 'userName avatar')
        .sort({ createdAt: -1 });

        const visiblePosts = posts.filter(post => {
            const setting = post.visibilitySetting;
            if (post.privacy === 'FRIENDS') return true;
            if (post.privacy === 'FRIENDONLY') {
                return setting?.type === 'ALLOWED' && setting.userIds.some(id => id.equals(userId));
            }
            if (post.privacy === 'EXCEPTFRIEND') {
                return setting?.type === 'EXCLUDED' && !setting.userIds.some(id => id.equals(userId));
            }
            return false;
        });
        return visiblePosts;
    }

    async getPostDetail(postId, currentUserId) {
        const post = await Post.findById(postId)
            .populate('userId', 'userName avatar')
            .lean();
        if (post.privacy === 'PUBLIC') return post;
        if (post.privacy === 'PRIVATE') {
            return post.userId._id.equals(currentUserId) ? post : null;
        }
        const currentUser = await User.findById(currentUserId).select('following');
        const isFriend = currentUser.following.includes(post.userId._id);
        if (post.privacy === 'FRIENDS') {
            return isFriend ? post : null;
        }
        if (post.privacy === 'FRIENDONLY') {
            if (post.visibilitySetting?.type === 'ALLOWED' && post.visibilitySetting.userIds.some(id => id.equals(currentUserId))) {
                return post;
            } else {
                return null;
            }
        }
        if (post.privacy === 'EXCEPTFRIEND') {
            if (post.visibilitySetting?.type === 'EXCLUDED' && post.visibilitySetting.userIds.some(id => id.equals(currentUserId))) {
                return null;
            } else {
                return isFriend ? post : null;
            }
        }
        return null;
    }

    async getPostsByUserId(targetUserId, currentUserId) {
        const currentUser = await User.findById(currentUserId).select('following');
        const isFriend = currentUser.following.includes(targetUserId);
        const posts = await Post.find({ userId: targetUserId })
            .populate('userId', 'userName avatar')
            .sort({ createdAt: -1 })
            .lean();
        return posts.filter(post => {
            const { privacy, visibilitySetting } = post;
            if (privacy === 'PUBLIC') return true;
            if (privacy === 'PRIVATE') return targetUserId.toString() === currentUserId.toString();
            if (privacy === 'FRIENDS') return isFriend;
            if (privacy === 'FRIENDONLY') {
                return (
                    visibilitySetting?.type === 'ALLOWED' &&
                    visibilitySetting.userIds.some(id => id.toString() === currentUserId.toString())
                );
            }
            if (privacy === 'EXCEPTFRIEND') {
                const isExcluded = visibilitySetting?.type === 'EXCLUDED' &&
                    visibilitySetting.userIds.some(id => id.toString() === currentUserId.toString());
                return isFriend && !isExcluded;
            }
            return false;
        });
    }

    async getPostLikes(postId) {
        const post = await Post.findById(postId).select('likes');
        const users = await User.find({ _id: { $in: post.likes } })
        .select('userName nameDisplay avatar');
        return users;
    }
};

module.exports = new PostService();