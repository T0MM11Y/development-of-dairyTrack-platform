const express = require("express");
const { addFeedType, deleteFeedType, updateFeedType, getFeedTypeById, getAllFeedTypes } = require("../controllers/feedTypeController");

const router = express.Router();

router.post("/", addFeedType);
router.delete("/:id", deleteFeedType);
router.put("/:id", updateFeedType);
router.get("/:id", getFeedTypeById);
router.get("/", getAllFeedTypes);

module.exports = router;
