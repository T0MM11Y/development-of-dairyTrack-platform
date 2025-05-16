const express = require("express");
const router = express.Router();
const feedStockController = require("../controllers/feedStockController");
const { verifyToken } = require("../controllers/verifyTokenController");

router.get("/",verifyToken, feedStockController.getAllFeedStocks);
router.get("/:id",verifyToken, feedStockController.getFeedStockById);
router.post("/add",verifyToken, feedStockController.addFeedStock);
router.put("/:id",verifyToken, feedStockController.updateFeedStock);


module.exports = router;
