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
  deleted_at: feedType.deletedAt, // Opsional: tambahkan untuk debugging atau admin
});

exports.addFeedType = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // Dari middleware verifyToken

  try {
    // Validasi input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama jenis pakan wajib diisi",
      });
    }

    // Cek apakah user valid
    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    // Buat FeedType
    const feedType = await FeedType.create({
      name,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
    });

    // Ambil data lengkap beserta nama user
    const feedTypeWithUsers = await FeedType.findByPk(feedType.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Jenis pakan berhasil ditambahkan",
      data: formatFeedTypeResponse(feedTypeWithUsers),
    });
  } catch (err) {
    console.error("Error in addFeedType:", err);

    // Penanganan nama duplikat
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada. Silakan gunakan nama yang berbeda.`,
      });
    }

    // Penanganan foreign key error
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Relasi user tidak valid. Pastikan ID user benar.",
      });
    }

    // Error umum
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.deleteFeedType = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari FeedType
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({
        success: false,
        message: "Jenis pakan tidak ditemukan",
      });
    }

    // Soft delete
    await feedType.destroy(); // Tanpa force: true untuk soft delete

    return res.status(200).json({
      success: true,
      message: "Jenis pakan berhasil dihapus",
    });
  } catch (err) {
    console.error("Error in deleteFeedType:", err);

    // Penanganan error umum
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
    // Validasi input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama jenis pakan wajib diisi",
      });
    }

    // Cari FeedType
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({
        success: false,
        message: "Jenis pakan tidak ditemukan",
      });
    }

    // Cek apakah user valid
    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    // Update FeedType
    await feedType.update({
      name,
      updated_by: userId,
    });

    // Ambil data lengkap beserta nama user
    const feedTypeWithUsers = await FeedType.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Jenis pakan berhasil diperbarui",
      data: formatFeedTypeResponse(feedTypeWithUsers),
    });
  } catch (err) {
    console.error("Error in updateFeedType:", err);

    // Penanganan nama duplikat
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada. Silakan gunakan nama yang berbeda.`,
      });
    }

    // Penanganan foreign key error
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Relasi user tidak valid. Pastikan ID user benar.",
      });
    }

    // Error umum
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