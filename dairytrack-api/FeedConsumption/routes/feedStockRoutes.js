const express = require("express");
const router = express.Router();
const feedStockController = require("../controllers/feedStockController");

router.get("/", feedStockController.getAllFeedStocks);
router.get("/:id", feedStockController.getFeedStockById);
router.post("/add", feedStockController.addFeedStock);
router.put("/:id", feedStockController.updateFeedStock);


module.exports = router;
