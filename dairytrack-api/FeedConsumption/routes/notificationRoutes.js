const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get feed stock related notifications
router.get('/feed-stock', notificationController.getFeedStockNotifications);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Check feed stock levels and create notifications if needed
router.post('/check-feed-stock', notificationController.checkFeedStockLevels);

module.exports = router;