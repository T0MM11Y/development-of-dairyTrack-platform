const Nutrisi = require("../models/nutritionModel");
const User = require("../models/userModel");

// Helper function to format Nutrisi response
const formatNutrisiResponse = (nutrisi) => ({
  id: nutrisi.id,
  name: nutrisi.name,
  unit: nutrisi.unit,
  user_id: nutrisi.user_id,
  user_name: nutrisi.User ? nutrisi.User.name : null,
  created_by: nutrisi.Creator ? { id: nutrisi.Creator.id, name: nutrisi.Creator.name } : null,
  updated_by: nutrisi.Updater ? { id: nutrisi.Updater.id, name: nutrisi.Updater.name } : null,
  created_at: nutrisi.createdAt,
  updated_at: nutrisi.updatedAt,
  deleted_at: nutrisi.deletedAt, // Opsional untuk debugging atau admin
});

exports.addNutrisi = async (req, res) => {
  const { name, unit } = req.body;
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama nutrisi wajib diisi",
      });
    }
    if (!unit) {
      return res.status(400).json({
        success: false,
        message: "Satuan nutrisi wajib diisi",
      });
    }

    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    const nutrisi = await Nutrisi.create({
      name,
      unit,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
    });

    const nutrisiWithUsers = await Nutrisi.findByPk(nutrisi.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Nutrisi berhasil ditambahkan",
      data: formatNutrisiResponse(nutrisiWithUsers),
    });
  } catch (err) {
    console.error("Error in addNutrisi:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Nutrisi dengan nama "${name}" sudah ada. Silakan gunakan nama yang berbeda.`,
      });
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Relasi user tidak valid. Pastikan ID user benar.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.updateNutrisi = async (req, res) => {
  const { id } = req.params;
  const { name, unit } = req.body;
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama nutrisi wajib diisi",
      });
    }
    if (!unit) {
      return res.status(400).json({
        success: false,
        message: "Satuan nutrisi wajib diisi",
      });
    }

    const nutrisi = await Nutrisi.findByPk(id);
    if (!nutrisi) {
      return res.status(404).json({
        success: false,
        message: "Nutrisi tidak ditemukan",
      });
    }

    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    await nutrisi.update({
      name,
      unit,
      updated_by: userId,
    });

    const nutrisiWithUsers = await Nutrisi.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Nutrisi berhasil diperbarui",
      data: formatNutrisiResponse(nutrisiWithUsers),
    });
  } catch (err) {
    console.error("Error in updateNutrisi:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Nutrisi dengan nama "${name}" sudah ada. Silakan gunakan nama yang berbeda.`,
      });
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Relasi user tidak valid. Pastikan ID user benar.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.deleteNutrisi = async (req, res) => {
  const { id } = req.params;

  try {
    const nutrisi = await Nutrisi.findByPk(id);
    if (!nutrisi) {
      return res.status(404).json({
        success: false,
        message: "Nutrisi tidak ditemukan",
      });
    }

    await nutrisi.destroy();

    return res.status(200).json({
      success: true,
      message: "Nutrisi berhasil dihapus",
    });
  } catch (err) {
    console.error("Error in deleteNutrisi:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
};

exports.getNutrisiById = async (req, res) => {
  const { id } = req.params;

  try {
    const nutrisi = await Nutrisi.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    if (!nutrisi) {
      return res.status(404).json({
        success: false,
        message: "Nutrisi tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatNutrisiResponse(nutrisi),
    });
  } catch (err) {
    console.error("Error in getNutrisiById:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getAllNutrisi = async (req, res) => {
  try {
    const nutrisiList = await Nutrisi.findAll({
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    const formattedNutrisiList = nutrisiList.map(formatNutrisiResponse);

    return res.status(200).json({
      success: true,
      data: formattedNutrisiList,
    });
  } catch (err) {
    console.error("Error in getAllNutrisi:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};