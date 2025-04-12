const express = require("express");
const { addFeed, deleteFeed, updateFeed, getFeedById, getAllFeeds } = require("../controllers/feedController");

const router = express.Router();

router.post("/", addFeed);
router.delete("/:id", deleteFeed);
router.put("/:id", updateFeed);
router.get("/:id", getFeedById);
router.get("/", getAllFeeds);

module.exports = router;
