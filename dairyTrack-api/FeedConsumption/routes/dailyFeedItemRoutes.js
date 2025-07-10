const express = require('express');
const router = express.Router();
const dailyFeedItemsController = require('../controllers/dailyFeedItemController');
const { verifyToken, validateFarmerOnly } = require("../controllers/verifyTokenController");

// Daily Feed Items Routes
router.post('/',verifyToken,validateFarmerOnly, dailyFeedItemsController.addFeedItem);
router.get('/',verifyToken, dailyFeedItemsController.getAllFeedItems);
router.get('/feedUsage',verifyToken, dailyFeedItemsController.getFeedUsageByDate);
router.get('/:id',verifyToken, dailyFeedItemsController.getFeedItemById);
router.get('/daily-feeds/:daily_feed_id/',verifyToken, dailyFeedItemsController.getFeedItemsByDailyFeedId);
router.put('/:id',verifyToken,validateFarmerOnly, dailyFeedItemsController.updateFeedItem);
router.delete('/:id',verifyToken,validateFarmerOnly, dailyFeedItemsController.deleteFeedItem);
router.post('/bulk-update',verifyToken,validateFarmerOnly, dailyFeedItemsController.bulkUpdateFeedItems);
// router.get('/export/pdf', verifyToken, dailyFeedItemsController.exportFeedItemsToPDF);
// router.get('/export/excel', verifyToken, dailyFeedItemsController.exportFeedItemsToExcel);


module.exports = router;