const express = require("express");
const router = express.Router();
const nutrisiController = require("../controllers/nutritionController");

router.post("/", nutrisiController.addNutrisi);
router.delete("/:id", nutrisiController.deleteNutrisi);
router.put("/:id", nutrisiController.updateNutrisi);
router.get("/:id", nutrisiController.getNutrisiById);
router.get("/", nutrisiController.getAllNutrisi);

module.exports = router;