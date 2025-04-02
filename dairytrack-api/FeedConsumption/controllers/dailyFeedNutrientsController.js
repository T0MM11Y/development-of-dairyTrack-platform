const DailyFeedNutrients = require("../models/dailyFeedNutrients");
const DailyFeedSession = require("../models/dailyFeedSessionModel"); // pastikan model ini ada

// GET all daily feed nutrients (dengan info sesi)
exports.getAllDailyFeedNutrients = async (req, res) => {
  try {
    const nutrients = await DailyFeedNutrients.findAll({
      include: [
        {
          model: DailyFeedSession,
          as: "dailyFeedSession",
        },
      ],
    });
    res.status(200).json({ success: true, data: nutrients });
  } catch (error) {
    console.error("Error fetching daily feed nutrients:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET daily feed nutrients berdasarkan daily_feed_id (melalui sesi)
exports.getNutrientsByDailyFeed = async (req, res) => {
  const { daily_feed_id } = req.params; // daily_feed_id yang ingin dicari
  try {
    const nutrients = await DailyFeedNutrients.findAll({
      include: [
        {
          model: DailyFeedSession,
          as: "dailyFeedSession",
          where: { daily_feed_id }, // Filter berdasarkan daily_feed_id yang ada di daily_feed_sessions
        },
      ],
    });
    res.status(200).json({ success: true, data: nutrients });
  } catch (error) {
    console.error("Error fetching nutrients by daily feed:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
