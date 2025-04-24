const Nutrisi = require("../models/nutritionModel");

exports.addNutrisi = async (req, res) => {
  const { name, unit } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const nutrisi = await Nutrisi.create({ name, unit });
    res.status(201).json({
      success: true,
      message: "Nutrisi created successfully",
      data: nutrisi,
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Nutrisi dengan nama "${name}" sudah ada! Silakan masukkan nama yang berbeda.`,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
};

exports.updateNutrisi = async (req, res) => {
  const { id } = req.params;
  const { name, unit } = req.body;

  try {
    const nutrisi = await Nutrisi.findByPk(id);
    if (!nutrisi) {
      return res.status(404).json({
        success: false,
        message: "Nutrisi not found",
      });
    }

    await nutrisi.update({ name, unit });
    res.status(200).json({
      success: true,
      message: "Nutrisi updated successfully",
      data: nutrisi,
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Nutrisi dengan nama "${name}" sudah ada! Silakan masukkan nama yang berbeda.`,
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
};

exports.deleteNutrisi = async (req, res) => {
  const { id } = req.params;

  try {
    const nutrisi = await Nutrisi.findByPk(id);
    if (!nutrisi) {
      return res.status(404).json({ message: "Nutrisi not found" });
    }

    await nutrisi.destroy();
    res.status(200).json({ message: "Nutrisi deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getNutrisiById = async (req, res) => {
  const { id } = req.params;

  try {
    const nutrisi = await Nutrisi.findByPk(id);
    if (!nutrisi) {
      return res.status(404).json({
        success: false,
        message: "Nutrisi tidak ditemukan",
      });
    }
    res.status(200).json({
      success: true,
      data: nutrisi,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
};

exports.getAllNutrisi = async (req, res) => {
  try {
    const nutrisi = await Nutrisi.findAll();
    res.status(200).json({ success: true, nutrisi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};