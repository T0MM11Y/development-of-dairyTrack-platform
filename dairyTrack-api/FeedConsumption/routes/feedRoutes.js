// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { verifyToken, validateAdminFarmerCRUD } = require("../controllers/verifyTokenController");

router.post('/', verifyToken, validateAdminFarmerCRUD, feedController.createFeed);
router.get('/',  verifyToken,feedController.getAllFeeds);
router.get('/:id',  verifyToken,feedController.getFeedById);
router.put('/:id',  verifyToken,validateAdminFarmerCRUD, feedController.updateFeed);
router.delete('/:id', verifyToken,validateAdminFarmerCRUD, feedController.deleteFeed);

module.exports = router;