const express = require("express");
const router = express.Router();
const {
  getAllDailyFeedDetails,
  getDailyFeedDetailById,
  createDailyFeedDetail,
  updateDailyFeedDetail,
  deleteDailyFeedDetail,
} = require("../controllers/dailyFeedDetailController");

router.get("/", getAllDailyFeedDetails);
router.get("/:id", getDailyFeedDetailById);
router.post("/", createDailyFeedDetail);
router.put("/:id", updateDailyFeedDetail);
router.delete("/:id", deleteDailyFeedDetail);

module.exports = router;
