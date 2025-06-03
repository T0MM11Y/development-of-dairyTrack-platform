const express = require("express");
const router = express.Router();
const feedTypeController = require("../controllers/feedTypeController");
const { verifyToken, validateAdminFarmerCRUD } = require("../controllers/verifyTokenController");

router.post("/", verifyToken, validateAdminFarmerCRUD, feedTypeController.addFeedType);
router.put("/:id", verifyToken, validateAdminFarmerCRUD, feedTypeController.updateFeedType);
router.delete("/:id", verifyToken, validateAdminFarmerCRUD, feedTypeController.deleteFeedType);
router.get("/:id", verifyToken, feedTypeController.getFeedTypeById);
router.get("/", verifyToken,  feedTypeController.getAllFeedTypes);

module.exports = router;