const express = require("express");
const router = express.Router();
const {
  getAllDailyFeedSessions,
  getDailyFeedSessionById,
  createDailyFeedSession,
  updateDailyFeedSession,
  deleteDailyFeedSession,
} = require("../controllers/dailyFeedSessionController");

router.get("/", getAllDailyFeedSessions);
router.get("/:id", getDailyFeedSessionById);
router.post("/", createDailyFeedSession);
router.put("/:id", updateDailyFeedSession);
router.delete("/:id", deleteDailyFeedSession);

module.exports = router;
