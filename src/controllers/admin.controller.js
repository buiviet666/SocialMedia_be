const adminService = require('../services/admin.service');

exports.getReportedUsers = async (req, res, next) => {
  try {
    const data = await adminService.getReportedUsers();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { reason, banDurationDays } = req.body;

    if (!reason || banDurationDays === undefined) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing data: reason or lockout time.",
      });
    }

    await adminService.banUser({ userId, reason, banDurationDays, bannedBy: req.user._id });

    res.status(200).json({
      statusCode: 200,
      message: "Account locked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await adminService.unbanUser(userId);
    res.status(200).json({
      statusCode: 200,
      message: "Account unlocked.",
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserReports = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const count = await adminService.deleteUserReports(userId);

    res.status(200).json({
      statusCode: 200,
      message: `Deleted ${count} reports.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReportedPosts = async (req, res, next) => {
  try {
    const reportedPosts = await adminService.getReportedPosts();
    res.json({ success: true, data: reportedPosts });
  } catch (err) {
    next(err);
  }
};

exports.banPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    await adminService.banPost(postId);
    res.json({ success: true, message: "Đã khóa bài viết và gỡ báo cáo." });
  } catch (err) {
    next(err);
  }
};

exports.unbanPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    await adminService.unbanPost(postId);
    res.json({ success: true, message: "Article unlocked." });
  } catch (err) {
    next(err);
  }
};


exports.deleteReportedPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    await adminService.deleteReportedPost(postId);
    res.json({ success: true, message: "Post hidden and report removed." });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardOverview = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardOverview();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getPostStatsByDate = async (req, res, next) => {
  try {
    const data = await adminService.getPostStatsByDate();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getHotPosts = async (req, res, next) => {
  try {
    const data = await adminService.getHotPosts();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getReportedMessages = async (req, res, next) => {
  try {
    const data = await adminService.getReportedMessages();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.banMessage = async (req, res, next) => {
  try {
    await adminService.banMessage(req.params.id);
    res.json({ success: true, message: "Tin nhắn đã bị ẩn và gỡ báo cáo." });
  } catch (err) {
    next(err);
  }
};

exports.unbanMessage = async (req, res, next) => {
  try {
    await adminService.unbanMessage(req.params.id);
    res.json({ success: true, message: "Đã mở khóa tin nhắn." });
  } catch (err) {
    next(err);
  }
};

exports.resolveMessageReports = async (req, res, next) => {
  try {
    await adminService.resolveMessageReports(req.params.id);
    res.json({ success: true, message: "Đã gỡ tất cả báo cáo tin nhắn." });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    await adminService.deleteMessage(req.params.id);
    res.json({ success: true, message: "Đã xóa tin nhắn và báo cáo liên quan." });
  } catch (err) {
    next(err);
  }
};

exports.getReportedComments = async (req, res, next) => {
  try {
    const data = await adminService.getReportedComments();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.banComment = async (req, res, next) => {
  try {
    await adminService.banComment(req.params.id);
    res.json({ success: true, message: "Bình luận đã bị ẩn và báo cáo được gỡ." });
  } catch (err) {
    next(err);
  }
};

exports.unbanComment = async (req, res, next) => {
  try {
    await adminService.unbanComment(req.params.id);
    res.json({ success: true, message: "Đã mở lại bình luận." });
  } catch (err) {
    next(err);
  }
};

exports.resolveCommentReports = async (req, res, next) => {
  try {
    await adminService.resolveCommentReports(req.params.id);
    res.json({ success: true, message: "Đã gỡ tất cả báo cáo của bình luận." });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    await adminService.deleteComment(req.params.id);
    res.json({ success: true, message: "Đã xóa bình luận và các báo cáo liên quan." });
  } catch (err) {
    next(err);
  }
};


exports.getAllUsersExceptMe = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsersExceptMe(req.user._id);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /admin/users/search?keyword=abc
exports.searchUsers = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const users = await adminService.searchUsers(req.user._id, keyword);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await adminService.getAllPosts();
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

exports.searchPosts = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const posts = await adminService.searchPosts(keyword);
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};