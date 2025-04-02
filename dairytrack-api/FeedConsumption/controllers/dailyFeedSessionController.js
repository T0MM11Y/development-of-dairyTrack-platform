const DailyFeedSession = require("../models/dailyFeedSessionModel");

// Mendapatkan semua sesi pakan harian
exports.getAllDailyFeedSessions = async (req, res) => {
  try {
    const sessions = await DailyFeedSession.findAll();
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error("Error fetching daily feed sessions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mendapatkan sesi pakan harian berdasarkan ID
exports.getDailyFeedSessionById = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await DailyFeedSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: "Daily feed session not found" });
    }
    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("Error fetching daily feed session:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Membuat sesi pakan harian baru
exports.createDailyFeedSession = async (req, res) => {
  const { daily_feed_id, session } = req.body;
  if (!daily_feed_id || !session) {
    return res
      .status(400)
      .json({ message: "daily_feed_id and session are required" });
  }
  try {
    const newSession = await DailyFeedSession.create({ daily_feed_id, session });
    res.status(201).json({ success: true, session: newSession });
  } catch (err) {
    console.error("Error creating daily feed session:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Memperbarui sesi pakan harian berdasarkan ID
exports.updateDailyFeedSession = async (req, res) => {
  const { id } = req.params;
  const { daily_feed_id, session } = req.body;
  try {
    const existingSession = await DailyFeedSession.findByPk(id);
    if (!existingSession) {
      return res.status(404).json({ message: "Daily feed session not found" });
    }
    await existingSession.update({ daily_feed_id, session });
    res.status(200).json({ success: true, session: existingSession });
  } catch (err) {
    console.error("Error updating daily feed session:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Menghapus sesi pakan harian berdasarkan ID
exports.deleteDailyFeedSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await DailyFeedSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: "Daily feed session not found" });
    }
    await session.destroy();
    res.status(200).json({ success: true, message: "Daily feed session deleted" });
  } catch (err) {
    console.error("Error deleting daily feed session:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
