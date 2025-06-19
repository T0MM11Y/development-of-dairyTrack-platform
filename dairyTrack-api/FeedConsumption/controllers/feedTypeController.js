const FeedType = require("../models/feedTypeModel.js");
const User = require("../models/userModel");

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
});


exports.addFeedType = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // dari middleware verifyToken

  try {
    // Validasi input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama jenis pakan wajib diisi",
      });
    }

    // Cek apakah user valid
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan`,
      });
    }

    // DIRECT APPROACH: Set the values directly instead of relying on hooks
    const feedType = await FeedType.create({
      name: name,
      user_id: userId,
      created_by: userId,
      updated_by: userId
    });

    // Ambil data lengkap beserta nama user pembuat & updater
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
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "ER_DUP_ENTRY"
    ) {
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
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({ success: false, message: "Jenis Pakan tidak ditemukan" });
    }

    await feedType.destroy();
    res.status(200).json({ success: true, message: "Jenis Pakan berhasil di hapus" });
  } catch (err) {
    console.error("Error in deleteFeedType:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
};

exports.updateFeedType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: "Nama harus di isi" });
    }

    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({ success: false, message: "Jenis pakan tidak ditemukan" });
    }

    // Validate user existence
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: `User ID ${userId} does not exist` });
    }

    // Update FeedType - set updated_by directly instead of relying on hooks
    await feedType.update({ 
      name: name,
      updated_by: userId 
    });

    // Fetch the updated feed type with associated user names
    const feedTypeWithUsers = await FeedType.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Feed type updated successfully",
      data: formatFeedTypeResponse(feedTypeWithUsers),
    });
  } catch (err) {
    console.error("Error in updateFeedType:", err);
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada! Silakan masukkan nama yang berbeda.`,
      });
    }
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID provided",
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
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
      return res.status(404).json({ success: false, message: "Jenis pakan tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      data: formatFeedTypeResponse(feedType),
    });
  } catch (err) {
    console.error("Error in getFeedTypeById:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
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

    res.status(200).json({
      success: true,
      data: formattedFeedTypes,
    });
  } catch (err) {
    console.error("Error in getAllFeedTypes:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
};