const express = require("express");
const router = express.Router();
const feedStockController = require("../controllers/feedStockController");
const { verifyToken, validateAdminFarmerCRUD, validateAdminOnly } = require("../controllers/verifyTokenController");

// FeedStockHistory routes
router.get("/history", verifyToken, (req, res, next) => {
  console.log("Hit route: GET /feedStock/history");
  feedStockController.getAllFeedStockHistory(req, res, next);
});
router.get("/history/:feedStockId", verifyToken, (req, res, next) => {
  console.log(`Hit route: GET /feedStock/history/${req.params.feedStockId}`);
  feedStockController.getFeedStockHistory(req, res, next);
});
router.get("/history/id/:id", verifyToken, (req, res, next) => {
  console.log(`Hit route: GET /feedStock/history/id/${req.params.id}`);
  feedStockController.getFeedStockHistoryById(req, res, next);
});
router.delete("/history/:id", verifyToken, validateAdminOnly, (req, res, next) => {
  console.log(`Hit route: DELETE /feedStock/history/${req.params.id}`);
  feedStockController.deleteFeedStockHistory(req, res, next);
});

// FeedStock routes
router.get("/", verifyToken, (req, res, next) => {
  console.log("Hit route: GET /feedStock");
  feedStockController.getAllFeedStocks(req, res, next);
});
router.get("/:id", verifyToken, (req, res, next) => {
  console.log(`Hit route: GET /feedStock/${req.params.id}`);
  feedStockController.getFeedStockById(req, res, next);
});
router.post("/add", verifyToken, validateAdminFarmerCRUD, (req, res, next) => {
  console.log("Hit route: POST /feedStock/add");
  feedStockController.addFeedStock(req, res, next);
});
router.put("/:id", verifyToken, validateAdminFarmerCRUD, (req, res, next) => {
  console.log(`Hit route: PUT /feedStock/${req.params.id}`);
  feedStockController.updateFeedStock(req, res, next);
});

module.exports = router;