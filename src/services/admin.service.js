const Report = require('../models/Report.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const Message = require('../models/Message.model');
const Comment = require('../models/Comment.model');
const moment = require('moment');

class AdminService {
    async getReportedUsers() {
        // B1: Lấy thống kê báo cáo theo người dùng
        const reports = await Report.aggregate([
        { $match: { targetType: 'USER' } },
        {
            $group: {
            _id: '$targetId',
            reportCount: { $sum: 1 },
            lastReason: { $last: '$reason' },
            lastReportedAt: { $last: '$createdAt' }
            }
        }
        ]);

        const reportedUserIds = reports.map((r) => r._id);

        // B2: Lấy danh sách người dùng hoặc đang bị khóa
        const users = await User.find({
        $or: [
            { _id: { $in: reportedUserIds } },
            { 'banInfo.isBanned': true } // banInfo sẽ thêm sau
        ]
        }).select('userName nameDisplay emailAddress avatar role banInfo');

        // B3: Gộp dữ liệu
        const merged = users.map(user => {
        const report = reports.find(r => r._id.toString() === user._id.toString());

        return {
            userId: user._id,
            userName: user.userName,
            nameDisplay: user.nameDisplay,
            email: user.emailAddress,
            avatar: user.avatar,
            role: user.role,
            reportCount: report?.reportCount || 0,
            lastReason: report?.lastReason || null,
            lastReportedAt: report?.lastReportedAt || null,
            isBanned: user?.banInfo?.isBanned || false,
            banReason: user?.banInfo?.reason || null,
            bannedAt: user?.banInfo?.bannedAt || null,
            banExpiresAt: user?.banInfo?.banExpiresAt || null,
        };
        });

        return merged;
    };


    async banUser({ userId, reason, banDurationDays, bannedBy }) {
        const user = await User.findById(userId);
        if (!user) {
        throw new Error("Không tìm thấy người dùng.");
        }

        const now = new Date();
        const expiresAt =
        banDurationDays === -1 ? null : new Date(now.getTime() + banDurationDays * 86400000);

        user.banInfo = {
        isBanned: true,
        reason,
        bannedAt: now,
        banExpiresAt: expiresAt,
        bannedBy,
        };

        await user.save();

        await Report.updateMany(
        { targetType: 'USER', targetId: userId, status: 'PENDING' },
        { $set: { status: 'RESOLVED' } }
        );
    };

    async unbanUser(userId) {
        const user = await User.findById(userId);

        if (!user) {
        throw new Error("Không tìm thấy người dùng.");
        }

        user.banInfo = {
            isBanned: false,
            reason: null,
            bannedAt: null,
            banExpiresAt: null,
            bannedBy: null,
        };

        await user.save();

        await Report.updateMany(
        { targetType: 'USER', targetId: userId, status: 'RESOLVED' },
        { $set: { status: 'PENDING' } }
        );
    };

    async deleteUserReports(userId) {
        const result = await Report.deleteMany({
            targetType: 'USER',
            targetId: userId,
        });

        return result.deletedCount || 0;
    };

    async getReportedPosts() {
        const reports = await Report.aggregate([
            {
            $match: { targetType: "POST" } // ❌ bỏ lọc status để lấy cả PENDING và RESOLVED
            },
            {
            $lookup: {
                from: "posts",
                localField: "targetId",
                foreignField: "_id",
                as: "post"
            }
            },
            { $unwind: "$post" },
            {
            $lookup: {
                from: "users",
                localField: "reporter",
                foreignField: "_id",
                as: "reporter"
            }
            },
            { $unwind: "$reporter" },
            {
            $lookup: {
                from: "users",
                localField: "post.userId",
                foreignField: "_id",
                as: "author"
            }
            },
            { $unwind: "$author" },
            {
            $group: {
                _id: "$targetId",
                reportCount: { $sum: 1 },
                post: { $first: "$post" },
                author: { $first: "$author" },
                lastReportedAt: { $max: "$createdAt" },
                reportDetails: {
                $push: {
                    reporterId: "$reporter._id",
                    reporterName: {
                    $ifNull: ["$reporter.nameDisplay", "$reporter.userName"]
                    },
                    reporterAvatar: "$reporter.avatar",
                    reason: "$reason",
                    reportedAt: "$createdAt",
                    reportStatus: "$status"
                }
                }
            }
            },
            {
            $project: {
                postId: "$_id",
                content: "$post.content",
                status: "$post.status",
                reportCount: 1,
                lastReportedAt: 1,
                reportDetails: 1,
                authorName: {
                $ifNull: ["$author.nameDisplay", "$author.userName"]
                },
                authorAvatar: "$author.avatar"
            }
            },
            { $sort: { lastReportedAt: -1 } }
        ]);

        return reports;
    };




    async banPost(postId) {
        await Post.findByIdAndUpdate(postId, { status: "HIDDEN" });
        await Report.updateMany({ targetType: "POST", targetId: postId }, { status: "RESOLVED" });
    }

    async unbanPost(postId) {
        await Post.findByIdAndUpdate(postId, { status: "ACTIVE" });
    }


    async deleteReportedPost(postId) {
        // 1. Ẩn bài viết
        await Post.findByIdAndUpdate(postId, { status: "HIDDEN" });

        // 2. Gỡ toàn bộ báo cáo (xóa hoặc chuyển trạng thái RESOLVED)
        await Report.updateMany(
        { targetType: "POST", targetId: postId },
        { status: "RESOLVED" }
        );
    }

    async getDashboardOverview() {
        const [totalUsers, totalPosts, totalLikes, pendingReports] = await Promise.all([
            User.countDocuments({ role: { $ne: "ADMIN" } }),
            Post.countDocuments(),
            Post.aggregate([
            { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } }
            ]).then(res => res[0]?.totalLikes || 0),
            Report.countDocuments({ status: "PENDING" })
        ]);

        return {
            totalUsers,
            totalPosts,
            totalInteractions: totalLikes,
            pendingReports
        };
    }

    async getPostStatsByDate() {
        const last30Days = moment().subtract(30, 'days').toDate();

        const stats = await Post.aggregate([
            { $match: { createdAt: { $gte: last30Days } } },
            {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                posts: { $sum: 1 }
            }
            },
            { $sort: { _id: 1 } },
            {
            $project: {
                date: "$_id",
                posts: 1,
                _id: 0
            }
            }
        ]);

        return stats;
    }

    async getHotPosts() {
        const posts = await Post.find()
            .sort({ likes: -1, createdAt: -1 })
            .limit(5)
            .select("title likes");

        return posts.map(p => ({
            title: p.title || "Không có tiêu đề",
            likes: p.likes.length
        }));
    }

    async getReportedMessages() {
        const reports = await Report.aggregate([
        { $match: { targetType: "MESSAGE" } },
        {
            $lookup: {
            from: "messages",
            localField: "targetId",
            foreignField: "_id",
            as: "message"
            }
        },
        { $unwind: "$message" },
        {
            $lookup: {
            from: "users",
            localField: "reporter",
            foreignField: "_id",
            as: "reporter"
            }
        },
        { $unwind: "$reporter" },
        {
            $lookup: {
            from: "users",
            localField: "message.senderId",
            foreignField: "_id",
            as: "sender"
            }
        },
        { $unwind: "$sender" },
        {
            $group: {
            _id: "$targetId",
            message: { $first: "$message" },
            sender: { $first: "$sender" },
            reportCount: { $sum: 1 },
            lastReportedAt: { $max: "$createdAt" },
            reportDetails: {
                $push: {
                reporterId: "$reporter._id",
                reporterName: {
                    $ifNull: ["$reporter.nameDisplay", "$reporter.userName"]
                },
                reporterAvatar: "$reporter.avatar",
                reason: "$reason",
                status: "$status",
                reportedAt: "$createdAt"
                }
            }
            }
        },
        {
            $project: {
            messageId: "$_id",
            content: "$message.content",
            status: "$message.status",
            reportCount: 1,
            lastReportedAt: 1,
            sender: {
                _id: "$sender._id",
                userName: "$sender.userName",
                nameDisplay: "$sender.nameDisplay",
                avatar: "$sender.avatar"
            },
            reportDetails: 1
            }
        },
        { $sort: { lastReportedAt: -1 } }
        ]);

        return reports;
    }

    async banMessage(messageId) {
        await Message.findByIdAndUpdate(messageId, { status: "HIDDEN" });
        await Report.updateMany(
        { targetType: "MESSAGE", targetId: messageId },
        { status: "RESOLVED" }
        );
    }

    async unbanMessage(messageId) {
        await Message.findByIdAndUpdate(messageId, { status: "SENT" });
    }

    async resolveMessageReports(messageId) {
        await Report.updateMany(
        { targetType: "MESSAGE", targetId: messageId },
        { status: "RESOLVED" }
        );
    }

    async deleteMessage(messageId) {
        await Message.findByIdAndDelete(messageId);
        await Report.deleteMany({ targetType: "MESSAGE", targetId: messageId });
    }

    async getReportedComments() {
        const reports = await Report.aggregate([
        { $match: { targetType: "COMMENT" } },
        {
            $lookup: {
            from: "Comments",
            localField: "targetId",
            foreignField: "_id",
            as: "comment"
            }
        },
        { $unwind: "$comment" },
        {
            $lookup: {
            from: "users",
            localField: "reporter",
            foreignField: "_id",
            as: "reporter"
            }
        },
        { $unwind: "$reporter" },
        {
            $lookup: {
            from: "users",
            localField: "comment.userId",
            foreignField: "_id",
            as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $group: {
            _id: "$targetId",
            comment: { $first: "$comment" },
            user: { $first: "$user" },
            reportCount: { $sum: 1 },
            lastReportedAt: { $max: "$createdAt" },
            reportDetails: {
                $push: {
                reporterId: "$reporter._id",
                reporterName: {
                    $ifNull: ["$reporter.nameDisplay", "$reporter.userName"]
                },
                reporterAvatar: "$reporter.avatar",
                reason: "$reason",
                status: "$status",
                reportedAt: "$createdAt"
                }
            }
            }
        },
        {
            $project: {
            commentId: "$_id",
            content: "$comment.content",
            status: "$comment.status",
            createdAt: "$comment.createdAt",
            reportCount: 1,
            lastReportedAt: 1,
            user: {
                _id: "$user._id",
                userName: "$user.userName",
                nameDisplay: "$user.nameDisplay",
                avatar: "$user.avatar"
            },
            reportDetails: 1
            }
        },
        { $sort: { lastReportedAt: -1 } }
        ]);

        return reports;
    }

    async banComment(id) {
        await Comment.findByIdAndUpdate(id, { status: "HIDDEN" });
        await Report.updateMany({ targetType: "COMMENT", targetId: id }, { status: "RESOLVED" });
    }

    async unbanComment(id) {
        await Comment.findByIdAndUpdate(id, { status: "VISIBLE" });
    }

    async resolveCommentReports(id) {
        await Report.updateMany({ targetType: "COMMENT", targetId: id }, { status: "RESOLVED" });
    }

    async deleteComment(id) {
        await Comment.findByIdAndDelete(id);
        await Report.deleteMany({ targetType: "COMMENT", targetId: id });
    }

    async getAllUsersExceptMe(currentUserId) {
        return await User.find({ _id: { $ne: currentUserId }, role: { $ne: "ADMIN" } })
        .select("userName nameDisplay avatar emailAddress role status createdAt");
    }

    // Tìm kiếm người dùng (trừ bản thân) theo từ khóa
    async searchUsers(currentUserId, keyword) {
        const regex = new RegExp(keyword, "i");

        return await User.find({
        _id: { $ne: currentUserId },
        role: { $ne: "ADMIN" },
        $or: [
            { userName: regex },
            { nameDisplay: regex },
            { email: regex }
        ]
        }).select("userName nameDisplay avatar email role status createdAt");
    }

    async getAllPosts() {
        return await Post.find()
        .populate('userId', 'userName nameDisplay avatar')
        .select('title content privacy status reportCount createdAt userId')
        .sort({ createdAt: -1 });
    }

    async searchPosts(keyword) {
        const regex = new RegExp(keyword, "i");

        return await Post.find({
        $or: [
            { userName: regex },
            { nameDisplay: regex },
            { title: regex },
            { privacy: regex }
        ]
        })
        .populate('userId', 'userName nameDisplay avatar')
        .select('title content privacy status reportCount createdAt userId')
        .sort({ createdAt: -1 });
    }
}

module.exports = new AdminService();
