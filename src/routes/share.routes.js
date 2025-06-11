const express = require('express');
const router = express.Router();
const { protect } = require('../services/jwt.service');
const shareController = require('../controllers/share.controller');

router.post('/', protect, shareController.sharePost);
router.get('/my', protect, shareController.getMyShares);
router.get('/user/:id', protect, shareController.getSharesByUserId);

module.exports = router;
