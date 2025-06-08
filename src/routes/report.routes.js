const express = require('express');
const router = express.Router();
const { protect } = require('../services/jwt.service');
const reportController = require('../controllers/report.controller');

router.post('/user', protect, reportController.reportUser);
router.post('/post', protect, reportController.reportPost);
router.post('/comment', protect, reportController.reportComment);
router.post('/message', protect, reportController.reportMessage);

module.exports = router;
