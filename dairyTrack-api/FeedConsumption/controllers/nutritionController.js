const Nutrisi = require("../models/nutritionModel");
const User = require("../models/userModel");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

// Helper function to format Nutrisi response
const formatNutrisiResponse = (nutrisi) => ({
  id: nutrisi.id,
  name: nutrisi.name,
  unit: nutrisi.unit,
  user_id: nutrisi.user_id,
  user_name: nutrisi.User ? nutrisi.User.name : null,
  created_by: nutrisi.Creator
    ? { id: nutrisi.Creator.id, name: nutrisi.Creator.name }
    : null,
  updated_by: nutrisi.Updater
    ? { id: nutrisi.Updater.id, name: nutrisi.Updater.name }
    : null,
  created_at: nutrisi.createdAt,
  updated_at: nutrisi.updatedAt,
  deleted_at: nutrisi.deletedAt,
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

    const trimmedName = name.trim();

    // Check for soft-deleted Nutrisi with the same name (case-insensitive)
    const existingSoftDeleted = await Nutrisi.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            trimmedName.toLowerCase()
          ),
          { deletedAt: { [Op.ne]: null } },
        ],
      },
      paranoid: false, // Include soft-deleted records
    });

    let nutrisi;
    if (existingSoftDeleted) {
      // Restore the soft-deleted record
      await existingSoftDeleted.restore();
      await existingSoftDeleted.update({
        unit,
        user_id: userId,
        updated_by: userId,
      });
      nutrisi = existingSoftDeleted;
    } else {
      // Create new Nutrisi
      nutrisi = await Nutrisi.create({
        name: trimmedName,
        unit,
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      });
    }

    // Fetch complete data with user details
    const nutrisiWithUsers = await Nutrisi.findByPk(nutrisi.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: existingSoftDeleted
        ? "Nutrisi berhasil dipulihkan"
        : "Nutrisi berhasil ditambahkan",
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
    console.log(
      "updateNutrisi - Data yang diterima:",
      JSON.stringify(req.body, null, 2)
    );

    // Validate: Ensure at least one field is provided
    if (!name && !unit) {
      return res.status(400).json({
        success: false,
        message: "Setidaknya nama atau satuan harus diisi untuk pembaruan.",
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

    // Use existing values if fields are not provided
    const trimmedName = name ? name.trim() : nutrisi.name;
    const updateUnit = unit !== undefined ? unit : nutrisi.unit;

    // Validate name is not empty
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Nama nutrisi tidak boleh kosong.",
      });
    }

    // Validate unit is not empty
    if (!updateUnit) {
      return res.status(400).json({
        success: false,
        message: "Satuan nutrisi tidak boleh kosong.",
      });
    }

    // Check for soft-deleted Nutrisi with the same name (case-insensitive), excluding current record
    let existingSoftDeleted = null;
    if (trimmedName.toLowerCase() !== nutrisi.name.toLowerCase()) {
      existingSoftDeleted = await Nutrisi.findOne({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("name")),
              trimmedName.toLowerCase()
            ),
            { deletedAt: { [Op.ne]: null } },
            { id: { [Op.ne]: id } },
          ],
        },
        paranoid: false, // Include soft-deleted records
      });
    }

    if (existingSoftDeleted) {
      // Restore the soft-deleted record and update it
      await existingSoftDeleted.restore();
      await existingSoftDeleted.update({
        name: trimmedName,
        unit: updateUnit,
        user_id: userId,
        updated_by: userId,
      });
      // Soft delete the current record to avoid duplicate
      await nutrisi.destroy();
      nutrisi.id = existingSoftDeleted.id; // Update ID for response
    } else {
      // Update current Nutrisi
      await nutrisi.update({
        name: trimmedName,
        unit: updateUnit,
        updated_by: userId,
      });
    }

    // Fetch updated data with user details
    const nutrisiWithUsers = await Nutrisi.findByPk(nutrisi.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: existingSoftDeleted
        ? "Nutrisi berhasil dipulihkan dan diperbarui"
        : "Nutrisi berhasil diperbarui",
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