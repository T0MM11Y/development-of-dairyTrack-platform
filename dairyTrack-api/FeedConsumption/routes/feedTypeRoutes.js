const express = require("express");
const router = express.Router();
const feedTypeController = require("../controllers/feedTypeController");
const { verifyToken } = require("../controllers/verifyTokenController");

// Protected routes with verifyToken middleware
router.post("/", verifyToken, feedTypeController.addFeedType);
router.put("/:id", verifyToken, feedTypeController.updateFeedType);
router.delete("/:id", verifyToken, feedTypeController.deleteFeedType);

// Unprotected routes (no login required)
router.get("/:id", feedTypeController.getFeedTypeById);
router.get("/", feedTypeController.getAllFeedTypes);

module.exports = router;