const reportService = require('../services/report.service');

// 📌 Báo cáo người dùng
exports.reportUser = async (req, res, next) => {
  try {
    const { targetUserId: targetId, reason } = req.body;
    if (!targetId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const reporter = req.user._id;
    const isDuplicate = await reportService.checkDuplicate(reporter, 'USER', targetId);
    if (isDuplicate) {
      return res.status(409).json({ message: 'Bạn đã báo cáo người dùng này trước đó.' });
    }

    const report = await reportService.createReport({
      reporter,
      targetType: 'USER',
      targetId: targetId,
      reason,
    });

    res.status(201).json({ success: true, message: 'Đã báo cáo người dùng', data: report });
  } catch (err) {
    next(err);
  }
};

// 📌 Báo cáo bài viết
exports.reportPost = async (req, res, next) => {
  try {
    const { postId: targetId, reason } = req.body;
    if (!targetId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const reporter = req.user._id;
    const isDuplicate = await reportService.checkDuplicate(reporter, 'POST', targetId);
    if (isDuplicate) {
      return res.status(409).json({ message: 'Bạn đã báo cáo bài viết này trước đó.' });
    }

    const report = await reportService.createReport({
      reporter,
      targetType: 'POST',
      targetId,
      reason,
    });

    res.status(201).json({ success: true, message: 'Đã báo cáo bài viết', data: report });
  } catch (err) {
    next(err);
  }
};

// 📌 Báo cáo bình luận
exports.reportComment = async (req, res, next) => {
  try {
    const { commentId: targetId, reason } = req.body;
    if (!targetId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const reporter = req.user._id;
    const isDuplicate = await reportService.checkDuplicate(reporter, 'COMMENT', targetId);
    if (isDuplicate) {
      return res.status(409).json({ message: 'Bạn đã báo cáo bình luận này trước đó.' });
    }

    const report = await reportService.createReport({
      reporter,
      targetType: 'COMMENT',
      targetId,
      reason,
    });

    res.status(201).json({ success: true, message: 'Đã báo cáo bình luận', data: report });
  } catch (err) {
    next(err);
  }
};

// 📌 Báo cáo tin nhắn
exports.reportMessage = async (req, res, next) => {
  try {
    const { messageId: targetId, reason } = req.body;
    if (!targetId || !reason) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const reporter = req.user._id;
    const isDuplicate = await reportService.checkDuplicate(reporter, 'MESSAGE', targetId);
    if (isDuplicate) {
      return res.status(409).json({ message: 'Bạn đã báo cáo tin nhắn này trước đó.' });
    }

    const report = await reportService.createReport({
      reporter,
      targetType: 'MESSAGE',
      targetId,
      reason,
    });

    res.status(201).json({ success: true, message: 'Đã báo cáo tin nhắn', data: report });
  } catch (err) {
    next(err);
  }
};
