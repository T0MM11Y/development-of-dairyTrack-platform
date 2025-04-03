const axios = require("axios");
const DailyFeedComplete = require("../models/dailyFeedComplete");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { calculateAndSaveNutrisi } = require("./dailyFeedNutrientsController");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");

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

// ** CREATE (Tambah Daily Feed) **
exports.createDailyFeed = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      // Simplified input - only require basic fields
      const { farmer_id, cow_id, date, session } = req.body;
  
      if (!farmer_id || !cow_id || !date || !session) {
        await t.rollback();
        return res.status(400).json({ message: "Semua field diperlukan" });
      }
  
      const weather = await getCurrentWeather();
  
      const existingFeed = await DailyFeedComplete.findOne({
        where: { cow_id, date, session }
      });
  
      if (existingFeed) {
        await t.rollback();
        return res.status(409).json({
          message: "Data sudah ada untuk sapi, tanggal, dan sesi yang diberikan",
          existing: existingFeed
        });
      }
  
      // Create new feed with default nutrition values
      const newFeed = await DailyFeedComplete.create({
        farmer_id,
        cow_id,
        date,
        session,
        weather,
        total_protein: 0,
        total_energy: 0,
        total_fiber: 0
      }, { transaction: t });
      
      await t.commit();
      
      // Return the created feed
      const createdFeed = await DailyFeedComplete.findByPk(newFeed.id, {
        include: [{
          model: DailyFeedItems,
          as: 'feedItems',
          include: [{
            model: Feed,
            as: 'feed',
            attributes: ['name', 'protein', 'energy', 'fiber']
          }]
        }]
      });
      
      return res.status(201).json({ success: true, data: createdFeed });
    } catch (error) {
      await t.rollback();
      console.error("Error creating daily feed:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

// ** GET ALL (Ambil Semua Daily Feed) **
exports.getAllDailyFeeds = async (req, res) => {
  try {
    const { farmer_id, cow_id, date, session } = req.query;
    const filter = {};

    if (farmer_id) filter.farmer_id = farmer_id;
    if (cow_id) filter.cow_id = cow_id;
    if (date) filter.date = date;
    if (session) filter.session = session;

    const feeds = await DailyFeedComplete.findAll({
      where: filter,
      include: [{
        model: DailyFeedItems,
        as: 'feedItems',
        include: [{
          model: Feed,
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }]
      }],
      order: [['date', 'DESC'], ['created_at', 'DESC']]
    });
    
    return res.status(200).json({ success: true, count: feeds.length, data: feeds });
  } catch (error) {
    console.error("Error fetching daily feeds:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** GET BY ID (Ambil Daily Feed Berdasarkan ID) **
exports.getDailyFeedById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const feed = await DailyFeedComplete.findByPk(id, {
      include: [{
        model: DailyFeedItems,
        as: 'feedItems',
        include: [{
          model: Feed,
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }]
      }]
    });
    
    if (!feed) return res.status(404).json({ message: "Daily feed not found" });
    return res.status(200).json({ success: true, data: feed });
  } catch (error) {
    console.error("Error fetching daily feed:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** UPDATE (Perbarui Daily Feed) **
exports.updateDailyFeed = async (req, res) => {
  const { id } = req.params;
  const { farmer_id, cow_id, date, session } = req.body;
  const t = await sequelize.transaction();
  
  try {
    const feed = await DailyFeedComplete.findByPk(id);
    if (!feed) {
      await t.rollback();
      return res.status(404).json({ message: "Daily feed not found" });
    }

    await feed.update({ farmer_id, cow_id, date, session }, { transaction: t });
    
    await t.commit();
    return res.status(200).json({ success: true, data: feed });
  } catch (error) {
    await t.rollback();
    console.error("Error updating daily feed:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** DELETE (Hapus Daily Feed) **
exports.deleteDailyFeed = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  
  try {
    const feed = await DailyFeedComplete.findByPk(id);
    if (!feed) {
      await t.rollback();
      return res.status(404).json({ message: "Daily feed not found" });
    }
    
    // This will cascade delete feed items as well
    await feed.destroy({ transaction: t });
    
    await t.commit();
    return res.status(200).json({ success: true, message: "Daily feed deleted" });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting daily feed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ** SEARCH (Pencarian Daily Feed dengan Filter Tanggal) **
exports.searchDailyFeeds = async (req, res) => {
  try {
    const { farmer_id, cow_id, start_date, end_date, session } = req.query;
    const filter = {};

    if (farmer_id) filter.farmer_id = farmer_id;
    if (cow_id) filter.cow_id = cow_id;
    if (session) filter.session = session;
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date[Op.gte] = start_date;
      if (end_date) filter.date[Op.lte] = end_date;
    }

    const feeds = await DailyFeedComplete.findAll({
      where: filter,
      include: [{
        model: DailyFeedItems,
        as: 'feedItems',
        include: [{
          model: Feed,
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }]
      }],
      order: [['date', 'DESC'], ['created_at', 'DESC']]
    });
    
    return res.status(200).json({ success: true, count: feeds.length, data: feeds });
  } catch (error) {
    console.error("Error searching daily feeds:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
// ** GET NUTRITIONAL INFO BY ID **
exports.getNutritionalInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Fetching nutritional info for ID: ${id}`);
    
    const feed = await DailyFeedComplete.findOne({
      where: { id },
      attributes: ['id', 'cow_id', 'date', 'total_protein', 'total_energy', 'total_fiber']
    });

    if (!feed) {
      console.warn(`⚠️ Nutritional info not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: "Nutritional info not found" });
    }

    console.log(`✅ Found nutritional info for ID: ${id}`, feed);

    return res.status(200).json({ success: true, data: feed });
  } catch (error) {
    console.error("❌ Error fetching nutritional info by ID:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** GET ALL NUTRITIONAL INFO **
exports.getAllNutritionalInfo = async (req, res) => {
  try {
    const feeds = await DailyFeedComplete.findAll({
      attributes: ['id', 'cow_id', 'date', 'total_protein', 'total_energy', 'total_fiber'],
      order: [['date', 'DESC']],
    });

    console.log("DEBUG: Feeds fetched:", feeds);

    if (!feeds || feeds.length === 0) {
      console.warn("⚠️ No nutritional data found!");
      return res.status(404).json({ success: false, message: "No nutritional data found" });
    }

    return res.status(200).json({ success: true, count: feeds.length, data: feeds });
  } catch (error) {
    console.error("❌ Error fetching all nutritional info:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

