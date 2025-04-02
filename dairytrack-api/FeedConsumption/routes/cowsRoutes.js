const express = require("express");
const { getAllCows,  } = require("../controllers/cowsController");

const router = express.Router();

router.get("/", getAllCows);
// router.delete("/:id", deleteFeedType);
// router.put("/:id", updateFeedType);
// router.get("/:id", getFeedTypeById);
// router.get("/", getAllFeedTypes);

module.exports = router;
