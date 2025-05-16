const express = require('express');
const router = express.Router();
const dailyFeedItemsController = require('../controllers/dailyFeedItemController');
const { verifyToken } = require("../controllers/verifyTokenController");

// Daily Feed Items Routes
router.post('/',verifyToken, dailyFeedItemsController.addFeedItem);
router.get('/',verifyToken, dailyFeedItemsController.getAllFeedItems);
router.get('/feedUsage',verifyToken, dailyFeedItemsController.getFeedUsageByDate);
router.get('/:id',verifyToken, dailyFeedItemsController.getFeedItemById);
router.get('/daily-feeds/:daily_feed_id/',verifyToken, dailyFeedItemsController.getFeedItemsByDailyFeedId);
router.put('/:id',verifyToken, dailyFeedItemsController.updateFeedItem);
router.delete('/:id',verifyToken, dailyFeedItemsController.deleteFeedItem);
router.post('/bulk-update',verifyToken, dailyFeedItemsController.bulkUpdateFeedItems);

module.exports = router;