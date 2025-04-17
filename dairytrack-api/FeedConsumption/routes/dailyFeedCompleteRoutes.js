const express = require('express');
const router = express.Router();
const dailyFeedCompleteController = require('../controllers/dailyFeedCompleteController');

// Daily Feed Complete Routes
router.post('/', dailyFeedCompleteController.createDailyFeed);
router.get('/', dailyFeedCompleteController.getAllDailyFeeds);
router.get('/search', dailyFeedCompleteController.searchDailyFeeds);
router.get('/:id', dailyFeedCompleteController.getDailyFeedById);
router.put('/:id', dailyFeedCompleteController.updateDailyFeed);
router.delete('/:id', dailyFeedCompleteController.deleteDailyFeed);
module.exports = router;