const express = require("express");
const router = express.Router();
const dailyFeedController = require("../controllers/dailyFeedController");

router.get("/", dailyFeedController.getAllDailyFeeds);
router.get("/:id", dailyFeedController.getDailyFeedById);
router.post("/", dailyFeedController.createDailyFeed);
router.put("/:id", dailyFeedController.updateDailyFeed);
router.delete("/:id", dailyFeedController.deleteDailyFeed);

module.exports = router;
