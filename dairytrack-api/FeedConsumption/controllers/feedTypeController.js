const FeedType = require("../models/feedTypeModel.js");

exports.addFeedType = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const feedType = await FeedType.create({ name });
    res.status(201).json({
      success: true,
      message: "Feed type created successfully",
      data: feedType,
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada! Silakan masukkan nama yang berbeda.`,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
};

exports.deleteFeedType = async (req, res) => {
  const { id } = req.params;

  try {
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({ message: "Feed type not found" });
    }

    await feedType.destroy();
    res.status(200).json({ message: "Feed type deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeedType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const feedType = await FeedType.findByPk(id);
    if (!feedType) {
      return res.status(404).json({ 
        success: false,
        message: "Feed type not found" 
      });
    }

    await feedType.update({ name });
    res.status(200).json({ 
      success: true,
      message: "Feed type updated successfully", 
      data: feedType 
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Jenis pakan dengan nama "${name}" sudah ada! Silakan masukkan nama yang berbeda.`,
      });
    }
    res.status(500).json({ 
      success: false,
      message: err.message || "Terjadi kesalahan pada server." 
    });
  }
};

exports.getFeedTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const feedType = await FeedType.findByPk(id);  // Fixed to use findByPk
    if (!feedType) {
      return res.status(404).json({ message: "Feed type not found" });
    }
    res.status(200).json({ feedType });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getAllFeedTypes = async (req, res) => {
  try {
    const feedTypes = await FeedType.findAll();
    res.status(200).json({ success: true, feedTypes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};