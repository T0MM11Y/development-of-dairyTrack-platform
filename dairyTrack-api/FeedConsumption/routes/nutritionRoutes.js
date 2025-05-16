const express = require("express");
const router = express.Router();
const nutrisiController = require("../controllers/nutritionController");
const { verifyToken } = require("../controllers/verifyTokenController");

router.post("/",verifyToken, nutrisiController.addNutrisi);
router.delete("/:id",verifyToken, nutrisiController.deleteNutrisi);
router.put("/:id",verifyToken, nutrisiController.updateNutrisi);
router.get("/:id",verifyToken, nutrisiController.getNutrisiById);
router.get("/",verifyToken, nutrisiController.getAllNutrisi);

module.exports = router;