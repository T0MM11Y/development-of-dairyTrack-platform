const FeedType = require("../models/feedTypeModel.js");

exports.addFeedType = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const feedType = await FeedType.create({ name });
    res
      .status(201)
      .json({ message: "Feed type created successfully", feedType });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Feed type name must be unique" });
    }
    res.status(500).json({ message: err.message });
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
      return res.status(404).json({ message: "Feed type not found" });
    }

    await feedType.update({ name });
    res
      .status(200)
      .json({ message: "Feed type updated successfully", feedType });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Feed type name must be unique" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const feedType = await FeedType.findById(id);
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
