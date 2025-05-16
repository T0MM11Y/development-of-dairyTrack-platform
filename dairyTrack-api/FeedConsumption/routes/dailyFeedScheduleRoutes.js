const express = require('express');
const router = express.Router();
const dailyFeedScheduleController = require('../controllers/dailyFeedScheduleController');
const { verifyToken } = require("../controllers/verifyTokenController");


// Daily Feed Schedule Routes
router.post('/',verifyToken, dailyFeedScheduleController.createDailyFeed);
router.get('/',verifyToken, dailyFeedScheduleController.getAllDailyFeeds);
router.get('/search',verifyToken, dailyFeedScheduleController.searchDailyFeeds);
router.get('/:id',verifyToken, dailyFeedScheduleController.getDailyFeedById);
router.put('/:id',verifyToken, dailyFeedScheduleController.updateDailyFeed);
router.delete('/:id',verifyToken, dailyFeedScheduleController.deleteDailyFeed);
module.exports = router;