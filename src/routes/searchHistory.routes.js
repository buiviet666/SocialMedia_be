const express = require('express');
const router = express.Router();
const { protect } = require('../services/jwt.service');
const searchController = require('../controllers/search.controller');

// Lịch sử tìm kiếm
router.get('/', protect, searchController.getSearchHistory);
router.post('/', protect, searchController.addToSearchHistory);
router.delete('/:id', protect, searchController.deleteSearchItem);
router.delete('/', protect, searchController.clearSearchHistory);

// Tìm kiếm tổng hợp
router.get('/all', protect, searchController.searchAll);
router.get('/hashtag/:tag', protect, searchController.searchByHashtag);
router.get('/suggestions', protect, searchController.getSuggestions);

module.exports = router;
