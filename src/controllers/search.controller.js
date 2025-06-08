const searchService = require('../services/search.service');

// GET: /api/search => lấy lịch sử tìm kiếm
exports.getSearchHistory = async (req, res, next) => {
  try {
    const history = await searchService.getHistoryByUser(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Get search history successfully!',
      data: history
    });
  } catch (err) {
    next(err);
  }
};

// POST: /api/search => thêm vào lịch sử tìm kiếm
exports.addToSearchHistory = async (req, res, next) => {
  try {
    const { type, targetId, keyword } = req.body;
    if (!type || !targetId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required fields: type or targetId'
      });
    }

    const newItem = await searchService.addHistory(req.user._id, type, targetId, keyword);

    res.status(201).json({
      statusCode: 201,
      message: 'Add to search history successfully!',
      data: newItem
    });
  } catch (err) {
    next(err);
  }
};

// DELETE: /api/search/:id => xoá 1 mục
exports.deleteSearchItem = async (req, res, next) => {
  try {
    const deleted = await searchService.deleteHistoryItem(req.user._id, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Search history item not found!'
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Deleted search history item successfully!'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE: /api/search => xoá toàn bộ lịch sử
exports.clearSearchHistory = async (req, res, next) => {
  try {
    await searchService.clearAllHistory(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Cleared all search history successfully!'
    });
  } catch (err) {
    next(err);
  }
};

exports.searchAll = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing keyword in query'
      });
    }

    const result = await searchService.searchAll(keyword);

    res.status(200).json({
      statusCode: 200,
      message: 'Search completed successfully!',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.searchByHashtag = async (req, res, next) => {
  try {
    const { tag } = req.params;

    if (!tag || tag.trim() === '') {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing hashtag in params'
      });
    }

    const posts = await searchService.searchByHashtag(tag);

    res.status(200).json({
      statusCode: 200,
      message: 'Search by hashtag successfully!',
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await searchService.getSuggestions(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: 'Get suggestions successfully!',
      data: suggestions
    });
  } catch (err) {
    next(err);
  }
};
