const express = require("express");
const router = express.Router();
const { getAllDailyFeedNutrients, getNutrientsByDailyFeed } = require("../controllers/dailyFeedNutrientsController");

// Endpoint untuk mengambil semua data nutrisi
router.get("/", getAllDailyFeedNutrients);

// Endpoint untuk mengambil data nutrisi berdasarkan daily_feed_id
// Contoh URL: /api/daily-feed-nutrients/daily_feed/1
router.get("/:daily_feed_id", getNutrientsByDailyFeed);

module.exports = router;
