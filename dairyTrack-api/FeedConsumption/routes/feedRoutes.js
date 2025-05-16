// routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { verifyToken } = require("../controllers/verifyTokenController");


router.post('/', verifyToken, feedController.createFeed);
router.get('/',  verifyToken,feedController.getAllFeeds);
router.get('/:id',  verifyToken,feedController.getFeedById);
router.put('/:id',  verifyToken,feedController.updateFeed);
router.delete('/:id', verifyToken, feedController.deleteFeed);

module.exports = router;