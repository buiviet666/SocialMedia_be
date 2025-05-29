const reportService = require('../services/report.service');

exports.reportUser = async (req, res, next) => {
  try {
    const { targetUserId, reason } = req.body;
    if (!targetUserId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const report = await reportService.reportUser(req.user._id, targetUserId, reason);
    res.status(201).json({ success: true, message: 'Đã báo cáo người dùng', data: report });
  } catch (err) {
    next(err);
  }
};

exports.reportPost = async (req, res, next) => {
  try {
    const { postId, reason } = req.body;
    if (!postId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const report = await reportService.reportPost(req.user._id, postId, reason);
    res.status(201).json({ success: true, message: 'Đã báo cáo bài viết', data: report });
  } catch (err) {
    next(err);
  }
};

exports.reportComment = async (req, res, next) => {
  try {
    const { commentId, reason } = req.body;
    if (!commentId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const report = await reportService.reportComment(req.user._id, commentId, reason);
    res.status(201).json({ success: true, message: 'Đã báo cáo bình luận', data: report });
  } catch (err) {
    next(err);
  }
};
