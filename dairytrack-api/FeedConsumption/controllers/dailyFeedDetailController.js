const axios = require("axios");
const DailyFeedDetail = require("../models/dailyFeedDetailModel");
const FeedStock = require("../models/feedStockModel");
const DailyFeedNutrients = require("../models/dailyFeedNutrients");

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "0c8e3b7192a29e0bb20925d0d3f4753b";
const LOCATION = "Pollung";

// Fungsi untuk mendapatkan cuaca
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

// Fungsi untuk menangani pembuatan DailyFeedDetail
exports.createDailyFeedDetail = async (req, res) => {
  try {
    const { daily_feed_id, session, feed_id, quantity } = req.body;

    // Pastikan semua field sudah ada dan tidak kosong
    if (!daily_feed_id || !session || !feed_id || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validasi session apakah benar
    const validSessions = ['pagi', 'siang', 'sore'];
    if (!validSessions.includes(session)) {
      return res.status(400).json({ message: "Invalid session value" });
    }

    console.log(`Processing record: daily_feed_id=${daily_feed_id}, session=${session}, feed_id=${feed_id}`);

    const weather = await getCurrentWeather();

    // Periksa apakah kombinasi daily_feed_id dan feed_id sudah ada
    const existingDetail = await DailyFeedDetail.findOne({
      where: {
        daily_feed_id,
        feed_id,
        session, // Menambahkan session dalam pencarian
      },
    });

    if (existingDetail) {
      console.log(`Found existing record: ${existingDetail.id}`);
      return res.status(409).json({
        message: "Data already exists for the given session and feed",
        existing: {
          id: existingDetail.id,
          daily_feed_id: existingDetail.daily_feed_id,
          feed_id: existingDetail.feed_id,
          session: existingDetail.session,
        },
      });
    }

    console.log("No existing record found, creating new one");

    // Simpan data detail pakan harian baru
    const newDetail = await DailyFeedDetail.create({
      daily_feed_id,
      feed_id,
      quantity,
      session, // Sesuaikan dengan session
      weather,
    });

    console.log(`Created new record: ${newDetail.id}`);

    // Ambil data feed berdasarkan feed_id untuk mendapatkan nilai protein, energy, dan fiber
    const feedStock = await FeedStock.findOne({ where: { id: feed_id } });

    if (!feedStock) {
      return res.status(400).json({ message: "Feed stock not found" });
    }

    // Hitung total nutrisi berdasarkan quantity * nilai feed stock
    const totalProtein = parseFloat(feedStock.protein) * parseFloat(quantity);
    const totalEnergy = parseFloat(feedStock.energy) * parseFloat(quantity);
    const totalFiber = parseFloat(feedStock.fiber) * parseFloat(quantity);

    // Kurangi stok pakan
    feedStock.stock = parseFloat(feedStock.stock) - parseFloat(quantity);
    await feedStock.save();

    // Cari apakah sudah ada DailyFeedNutrients untuk sesi ini
    let nutrients = await DailyFeedNutrients.findOne({
      where: { daily_feed_session_id: daily_feed_id },
    });

    if (nutrients) {
      // Jika sudah ada, update nilai totalnya
      nutrients.total_protein += totalProtein;
      nutrients.total_energy += totalEnergy;
      nutrients.total_fiber += totalFiber;
      await nutrients.save();
    } else {
      // Jika belum ada, buat record baru
      await DailyFeedNutrients.create({
        daily_feed_session_id: daily_feed_id,
        total_protein: totalProtein,
        total_energy: totalEnergy,
        total_fiber: totalFiber,
      });
    }

    console.log(`✅ Nutrisi berhasil diperbarui untuk sesi ${daily_feed_id}`);

    return res.status(201).json({ success: true, data: newDetail });
  } catch (error) {
    console.error("Error creating daily feed detail:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Fungsi untuk mengambil semua data daily_feed_details
exports.getAllDailyFeedDetails = async (req, res) => {
  try {
    const details = await DailyFeedDetail.findAll();
    return res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error("Error fetching daily feed details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fungsi untuk mengambil data daily_feed_detail berdasarkan ID
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

// Fungsi untuk mengupdate daily_feed_detail
exports.updateDailyFeedDetail = async (req, res) => {
  const { id } = req.params;
  const { daily_feed_id, session, feed_id, quantity } = req.body;

  try {
    const detail = await DailyFeedDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({ message: "Daily feed detail not found" });
    }

    console.log(`Updating record ${id} with daily_feed_id=${daily_feed_id}, session=${session}, feed_id=${feed_id}`);

    await detail.update({
      daily_feed_id,
      session, // Menambahkan session
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

// Fungsi untuk menghapus daily_feed_detail
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
