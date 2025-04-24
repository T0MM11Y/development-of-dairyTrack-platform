// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

router.post('/', feedController.createFeed);
router.get('/', feedController.getAllFeeds);
router.get('/:id', feedController.getFeedById);
router.put('/:id', feedController.updateFeed);
router.delete('/:id', feedController.deleteFeed);

module.exports = router;