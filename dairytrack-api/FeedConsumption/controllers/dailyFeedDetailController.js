const axios = require("axios");
const DailyFeedDetail = require("../models/dailyFeedDetailModel");

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "0c8e3b7192a29e0bb20925d0d3f4753b";
const LOCATION = "Pollung";

// Fungsi mendapatkan cuaca
const getCurrentWeather = async () => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${WEATHER_API_KEY}&units=metric&lang=ID`
    );
    return response.data.weather[0].description;
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return "Unknown";
  }
};

// **CREATE (Tambah Daily Feed Detail)**
exports.createDailyFeedDetail = async (req, res) => {
  try {
    const { daily_feed_session_id, feed_id, quantity } = req.body;

    if (!daily_feed_session_id || !feed_id || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(`Processing record: session=${daily_feed_session_id}, feed=${feed_id}`);

    const weather = await getCurrentWeather();

    // Periksa apakah kombinasi `daily_feed_session_id` dan `feed_id` sudah ada
    const existingDetail = await DailyFeedDetail.findOne({
      where: {
        daily_feed_session_id,
        feed_id,
      },
    });

    if (existingDetail) {
      console.log(`Found existing record: ${existingDetail.id}`);
      return res.status(409).json({
        message: "Data already exists for the given session and feed",
        existing: {
          id: existingDetail.id,
          session: existingDetail.daily_feed_session_id,
          feed: existingDetail.feed_id,
        },
      });
    }

    console.log("No existing record found, creating new one");

    const newDetail = await DailyFeedDetail.create({
      daily_feed_session_id,
      feed_id,
      quantity,
      weather,
    });

    console.log(`Created new record: ${newDetail.id}`);
    return res.status(201).json({ success: true, data: newDetail });
  } catch (error) {
    console.error("Error creating daily feed detail:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// **GET ALL (Ambil Semua Daily Feed Detail)**
exports.getAllDailyFeedDetails = async (req, res) => {
  try {
    const details = await DailyFeedDetail.findAll();
    return res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error("Error fetching daily feed details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// **GET BY ID (Ambil Daily Feed Detail Berdasarkan ID)**
exports.getDailyFeedDetailById = async (req, res) => {
  const { id } = req.params;
  try {
    const detail = await DailyFeedDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({ message: "Daily feed detail not found" });
    }
    return res.status(200).json({ success: true, data: detail });
  } catch (error) {
    console.error("Error fetching daily feed detail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// **UPDATE (Perbarui Daily Feed Detail)**
exports.updateDailyFeedDetail = async (req, res) => {
  const { id } = req.params;
  const { daily_feed_session_id, feed_id, quantity } = req.body;

  try {
    const detail = await DailyFeedDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({ message: "Daily feed detail not found" });
    }

    console.log(`Updating record ${id} with session=${daily_feed_session_id}, feed=${feed_id}`);

    await detail.update({
      daily_feed_session_id,
      feed_id,
      quantity,
    });

    console.log("Record updated successfully");

    return res.status(200).json({ success: true, data: detail });
  } catch (error) {
    console.error("Error updating daily feed detail:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// **DELETE (Hapus Daily Feed Detail)**
exports.deleteDailyFeedDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const detail = await DailyFeedDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({ message: "Daily feed detail not found" });
    }

    await detail.destroy();

    return res.status(200).json({ success: true, message: "Daily feed detail deleted" });
  } catch (error) {
    console.error("Error deleting daily feed detail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
