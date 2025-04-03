const DailyFeed = require("../models/dailyFeedModel");

// Get all daily feeds
exports.getAllDailyFeeds = async (req, res) => {
  try {
    const feeds = await DailyFeed.findAll();
    res.status(200).json({ success: true, feeds });
  } catch (error) {
    console.error("Error fetching daily feeds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get daily feed by ID
exports.getDailyFeedById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ field: "id", message: "Invalid ID format" });
  }

  try {
    const feed = await DailyFeed.findByPk(id);

    if (!feed) {
      return res.status(404).json({ field: "id", message: "Daily feed not found" });
    }

    res.status(200).json({ success: true, feed });
  } catch (error) {
    console.error("Error fetching daily feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new daily feed
exports.createDailyFeed = async (req, res) => {
  const { farmer_id, cow_id, date } = req.body;

  if (!farmer_id || !cow_id || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newFeed = await DailyFeed.create({ farmer_id, cow_id, date });
    res.status(201).json({ success: true, feed: newFeed });
  } catch (error) {
    console.error("Error creating daily feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update daily feed by ID
exports.updateDailyFeed = async (req, res) => {
  const { id } = req.params;
  const { farmer_id, cow_id, date } = req.body;

  try {
    const feed = await DailyFeed.findByPk(id);
    if (!feed) {
      return res.status(404).json({ field: "id", message: "Daily feed not found" });
    }

    await feed.update({ farmer_id, cow_id, date });
    res.status(200).json({ success: true, message: "Daily feed updated", feed });
  } catch (error) {
    console.error("Error updating daily feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete daily feed by ID
exports.deleteDailyFeed = async (req, res) => {
  const { id } = req.params;

  try {
    const feed = await DailyFeed.findByPk(id);
    if (!feed) {
      return res.status(404).json({ field: "id", message: "Daily feed not found" });
    }

    await feed.destroy();
    res.status(200).json({ success: true, message: "Daily feed deleted" });
  } catch (error) {
    console.error("Error deleting daily feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
