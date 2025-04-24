const express = require('express');
const router = express.Router();
const dailyFeedScheduleController = require('../controllers/dailyFeedScheduleController');

// Daily Feed Schedule Routes
router.post('/', dailyFeedScheduleController.createDailyFeed);
router.get('/', dailyFeedScheduleController.getAllDailyFeeds);
router.get('/search', dailyFeedScheduleController.searchDailyFeeds);
router.get('/:id', dailyFeedScheduleController.getDailyFeedById);
router.put('/:id', dailyFeedScheduleController.updateDailyFeed);
router.delete('/:id', dailyFeedScheduleController.deleteDailyFeed);
module.exports = router;