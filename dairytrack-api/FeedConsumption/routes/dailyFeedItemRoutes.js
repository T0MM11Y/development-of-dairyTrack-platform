const express = require('express');
const router = express.Router();
const dailyFeedItemsController = require('../controllers/dailyFeedItemController');

// Daily Feed Items Routes
router.post('/', dailyFeedItemsController.addFeedItem);
router.get('/', dailyFeedItemsController.getAllFeedItems);
router.get('/:id', dailyFeedItemsController.getFeedItemById);
router.get('/daily-feeds/:daily_feed_id/', dailyFeedItemsController.getFeedItemsByDailyFeedId);
router.put('/:id', dailyFeedItemsController.updateFeedItem);
router.delete('/:id', dailyFeedItemsController.deleteFeedItem);
router.post('/bulk-update', dailyFeedItemsController.bulkUpdateFeedItems);

module.exports = router;