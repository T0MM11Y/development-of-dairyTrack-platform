const express = require("express");
const router = express.Router();
const nutrisiController = require("../controllers/nutritionController");
const { verifyToken, validateAdminFarmerCRUD } = require("../controllers/verifyTokenController");

router.post("/",verifyToken,validateAdminFarmerCRUD, nutrisiController.addNutrisi);
router.delete("/:id",verifyToken,validateAdminFarmerCRUD, nutrisiController.deleteNutrisi);
router.put("/:id",verifyToken,validateAdminFarmerCRUD, nutrisiController.updateNutrisi);
router.get("/:id",verifyToken, nutrisiController.getNutrisiById);
router.get("/",verifyToken, nutrisiController.getAllNutrisi);

module.exports = router;