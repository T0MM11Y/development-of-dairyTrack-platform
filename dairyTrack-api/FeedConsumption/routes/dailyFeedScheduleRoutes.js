const express = require('express');
const router = express.Router();
const dailyFeedScheduleController = require('../controllers/dailyFeedScheduleController');
const { verifyToken, validateFarmerOnly } = require("../controllers/verifyTokenController");


// Daily Feed Schedule Routes
router.post('/',verifyToken,validateFarmerOnly, dailyFeedScheduleController.createDailyFeed);
router.get('/',verifyToken, dailyFeedScheduleController.getAllDailyFeeds);
router.get('/search',verifyToken, dailyFeedScheduleController.searchDailyFeeds);
router.get('/:id',verifyToken, dailyFeedScheduleController.getDailyFeedById);
router.put('/:id',verifyToken,validateFarmerOnly, dailyFeedScheduleController.updateDailyFeed);
router.delete('/:id',verifyToken,validateFarmerOnly, dailyFeedScheduleController.deleteDailyFeed);
module.exports = router;