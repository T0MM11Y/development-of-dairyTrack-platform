const FeedType = require("../models/feedTypeModel.js");
const User = require("../models/userModel");
const { Sequelize } = require("sequelize");

// Helper function to format FeedType response
const formatFeedTypeResponse = (feedType) => ({
  id: feedType.id,
  name: feedType.name,
  user_id: feedType.user_id,
  user_name: feedType.User ? feedType.User.name : null,
  created_by: feedType.Creator ? { id: feedType.Creator.id, name: feedType.Creator.name } : null,
  updated_by: feedType.Updater ? { id: feedType.Updater.id, name: feedType.Updater.name } : null,
  created_at: feedType.createdAt,
  updated_at: feedType.updatedAt,
  deleted_at: feedType.deletedAt,
});

exports.addFeedType = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // From middleware verifyToken

  try {
    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama jenis pakan wajib diisi",
      });
    }

    // Check if user is valid
    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    // Check for soft-deleted FeedType with the same name
    const existingSoftDeleted = await FeedType.findOne({
      where: { name, deletedAt: { [Sequelize.Op.ne]: null } },
      paranoid: false, // Include soft-deleted records
    });

    let feedType;
    if (existingSoftDeleted) {
      // Restore the soft-deleted record
      await existingSoftDeleted.restore();
      await existingSoftDeleted.update({
        user_id: userId,
        updated_by: userId,
      });
      feedType = existingSoftDeleted;
    } else {
      // Create new FeedType
      feedType = await FeedType.create({
        name,
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      });
    }

    // Fetch complete data with user details
    const feedTypeWithUsers = await FeedType.findByPk(feedType.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: existingSoftDeleted
        ? "Jenis pakan berhasil dipulihkan"
        : "Jenis pakan berhasil ditambahkan",
      data: formatFeedTypeResponse(feedTypeWithUsers),
    });
  } catch (err) {
    console.error("Error in addFeedType:", err);

    // Handle duplicate name error (for non-deleted records)
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada. Silakan gunakan nama yang berbeda.`,
      });
    }

    // Handle foreign key error
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Relasi user tidak valid. Pastikan ID user benar.",
      });
    }

    // General error
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.deleteFeedType = async (req, res) => {
  const { id } = req.params;

  try {
    // Find FeedType
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({
        success: false,
        message: "Jenis pakan tidak ditemukan",
      });
    }

    // Soft delete
    await feedType.destroy(); // Without force: true for soft delete

    return res.status(200).json({
      success: true,
      message: "Jenis pakan berhasil dihapus",
    });
  } catch (err) {
    console.error("Error in deleteFeedType:", err);

    // Handle general error
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
};

exports.updateFeedType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama jenis pakan wajib diisi",
      });
    }

    // Find FeedType
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({
        success: false,
        message: "Jenis pakan tidak ditemukan",
      });
    }

    // Check if user is valid
    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    // Check for soft-deleted FeedType with the same name
    const existingSoftDeleted = await FeedType.findOne({
      where: {
        name,
        deletedAt: { [Sequelize.Op.ne]: null },
        id: { [Sequelize.Op.ne]: id }, // Exclude the current record
      },
      paranoid: false, // Include soft-deleted records
    });

    if (existingSoftDeleted) {
      // Restore the soft-deleted record and update it
      await existingSoftDeleted.restore();
      await existingSoftDeleted.update({
        user_id: userId,
        updated_by: userId,
      });
      // Soft delete the current record to avoid duplicate
      await feedType.destroy();
      feedType.id = existingSoftDeleted.id; // Update ID for response
    } else {
      // Update current FeedType
      await feedType.update({
        name,
        updated_by: userId,
      });
    }

    // Fetch complete data with user details
    const feedTypeWithUsers = await FeedType.findByPk(feedType.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: existingSoftDeleted
        ? "Jenis pakan berhasil dipulihkan dan diperbarui"
        : "Jenis pakan berhasil diperbarui",
      data: formatFeedTypeResponse(feedTypeWithUsers),
    });
  } catch (err) {
    console.error("Error in updateFeedType:", err);

    // Handle duplicate name error (for non-deleted records)
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada. Silakan gunakan nama yang berbeda.`,
      });
    }

    // Handle foreign key error
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Relasi user tidak valid. Pastikan ID user benar.",
      });
    }

    // General error
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
};

exports.getFeedTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const feedType = await FeedType.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    if (!feedType) {
      return res.status(404).json({
        success: false,
        message: "Jenis pakan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatFeedTypeResponse(feedType),
    });
  } catch (err) {
    console.error("Error in getFeedTypeById:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
};

exports.getAllFeedTypes = async (req, res) => {
  try {
    const feedTypes = await FeedType.findAll({
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    const formattedFeedTypes = feedTypes.map(formatFeedTypeResponse);

    return res.status(200).json({
      success: true,
      data: formattedFeedTypes,
    });
  } catch (err) {
    console.error("Error in getAllFeedTypes:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
};