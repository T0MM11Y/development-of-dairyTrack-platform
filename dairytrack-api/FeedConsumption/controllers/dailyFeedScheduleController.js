const axios = require("axios");
const DailyFeedSchedule = require("../models/dailyFeedSchedule");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");
const Nutrisi = require("../models/nutritionModel");
const FeedNutrisi = require("../models/feedNutritionModel");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const NodeCache = require("node-cache");

// Inisialisasi cache untuk data cuaca (TTL: 1 jam)
const weatherCache = new NodeCache({ stdTTL: 3600 });

const WEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY || "0c8e3b7192a29e0bb20925d0d3f4753b";
const LOCATION = process.env.WEATHER_LOCATION || "Pollung";

// Fungsi mendapatkan cuaca
const getCurrentWeather = async () => {
  if (!WEATHER_API_KEY) {
    console.error("Weather API key is not configured");
    return "Unknown";
  }

  const cacheKey = `weather_${LOCATION}`;
  const cachedWeather = weatherCache.get(cacheKey);

  if (cachedWeather) {
    return cachedWeather;
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${WEATHER_API_KEY}&units=metric&lang=ID`
    );
    const weatherDescription = response.data.weather[0].description;
    weatherCache.set(cacheKey, weatherDescription);
    return weatherDescription;
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return "Unknown";
  }
};

const calculateTotalNutrients = async (items) => {
  const nutrientTotals = {};

  for (const item of items) {
    const feed = await Feed.findByPk(item.feed_id, {
      include: [
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [
            {
              model: Nutrisi,
              as: "Nutrisi",
              attributes: ["id", "name", "unit"],
            },
          ],
        },
      ],
    });

    if (feed && feed.FeedNutrisiRecords) {
      feed.FeedNutrisiRecords.forEach((nutrisi) => {
        const nutrientId = nutrisi.Nutrisi.id;
        const nutrientName = nutrisi.Nutrisi.name;
        const nutrientUnit = nutrisi.Nutrisi.unit;
        const nutrientValue = nutrisi.value * (item.quantity / 1000); // Konversi ke kg

        if (!nutrientTotals[nutrientId]) {
          nutrientTotals[nutrientId] = {
            name: nutrientName,
            unit: nutrientUnit,
            total: 0,
          };
        }
        nutrientTotals[nutrientId].total += nutrientValue;
      });
    }
  }

  return Object.values(nutrientTotals);
};

// **CREATE (Buat Daily Feed Baru)**
exports.createDailyFeed = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { cow_id, date, session, items = [] } = req.body;

    // Validasi input
    if (!cow_id || !date || !session) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "cow_id, date, dan session diperlukan" });
    }

    // Ambil cuaca
    const weather = await getCurrentWeather();

    // Buat DailyFeedSchedule
    const newFeed = await DailyFeedSchedule.create(
      {
        cow_id,
        date,
        session,
        weather,
      },
      { transaction }
    );

    // Buat DailyFeedItems jika ada
    if (items.length > 0) {
      const feedItems = items.map((item) => ({
        daily_feed_id: newFeed.id,
        feed_id: item.feed_id,
        quantity: item.quantity,
      }));

      await DailyFeedItems.bulkCreate(feedItems, { transaction });

      // Hitung total nutrisi
      const totalNutrients = await calculateTotalNutrients(feedItems);
      newFeed.total_nutrients = totalNutrients;
      await newFeed.save({ transaction });
    }

    // Ambil data lengkap untuk respons
    const createdFeed = await DailyFeedSchedule.findByPk(newFeed.id, {
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["id", "name", "price"],
              include: [
                {
                  model: FeedNutrisi,
                  as: "FeedNutrisiRecords", // Perbaiki alias
                  include: [
                    {
                      model: Nutrisi,
                      as: "Nutrisi",
                      attributes: ["name", "unit"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });

    await transaction.commit();
    return res.status(201).json({ success: true, data: createdFeed });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating daily feed:", error);
    return res
      .status(500)
      .json({ message: "Gagal membuat daily feed", error: error.message });
  }
};

// **GET ALL (Ambil Semua Daily Feed)**
exports.getAllDailyFeeds = async (req, res) => {
  try {
    const { cow_id, date, session } = req.query;
    const filter = {};

    if (cow_id) filter.cow_id = cow_id;
    if (date) filter.date = date;
    if (session) filter.session = session;

    const feeds = await DailyFeedSchedule.findAll({
      where: filter,
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["id", "name", "price"],
              include: [
                {
                  model: FeedNutrisi,
                  as: "FeedNutrisiRecords", // Pastikan alias benar
                  include: [
                    {
                      model: Nutrisi,
                      as: "Nutrisi",
                      attributes: ["name", "unit"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res
      .status(200)
      .json({ success: true, count: feeds.length, data: feeds });
  } catch (error) {
    console.error("Error fetching daily feeds:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil daily feeds", error: error.message });
  }
};

// **GET BY ID (Ambil Daily Feed Berdasarkan ID)**
exports.getDailyFeedById = async (req, res) => {
  const { id } = req.params;

  try {
    const feed = await DailyFeedSchedule.findByPk(id, {
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["id", "name", "price"],
              include: [
                {
                  model: FeedNutrisi,
                  as: "FeedNutrisiRecords", // Fixed alias
                  include: [
                    {
                      model: Nutrisi,
                      as: "Nutrisi",
                      attributes: ["name", "unit"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!feed) {
      return res.status(404).json({ message: "Daily feed tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: feed });
  } catch (error) {
    console.error("Error fetching daily feed:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil daily feed", error: error.message });
  }
};

// **UPDATE (Perbarui Daily Feed)**
exports.updateDailyFeed = async (req, res) => {
  const { id } = req.params;
  const { cow_id, date, session } = req.body;
  let t = await sequelize.transaction();

  try {
    const feed = await DailyFeedSchedule.findByPk(id, { transaction: t });
    if (!feed) {
      await t.rollback();
      return res.status(404).json({ message: "Daily feed tidak ditemukan" });
    }

    // Validasi input
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Format tanggal harus YYYY-MM-DD" });
    }

    if (session) {
      const validSessions = ["Pagi", "Siang", "Sore"];
      if (!validSessions.includes(session)) {
        await t.rollback();
        return res.status(400).json({
          message: `Session harus salah satu dari: ${validSessions.join(", ")}`,
        });
      }
    }

    // Cek duplikasi
    const existingFeed = await DailyFeedSchedule.findOne({
      where: {
        cow_id: cow_id || feed.cow_id,
        date: date || feed.date,
        session: session || feed.session,
        id: { [Op.ne]: id },
      },
      transaction: t,
    });

    if (existingFeed) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: `Data untuk sapi ID ${cow_id || feed.cow_id} pada ${
          date || feed.date
        } sesi ${session || feed.session} sudah ada`,
        existing: existingFeed,
      });
    }

    // Update feed
    await feed.update(
      {
        cow_id: cow_id || feed.cow_id,
        date: date || feed.date,
        session: session || feed.session,
        weather: await getCurrentWeather(), // Perbarui cuaca
      },
      { transaction: t }
    );

    await t.commit();

    // Ambil data lengkap untuk response
    const updatedFeed = await DailyFeedSchedule.findByPk(id, {
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["id", "name", "price"],
              include: [
                {
                  model: FeedNutrisi,
                  as: "FeedNutrisi",
                  include: [
                    {
                      model: Nutrisi,
                      as: "Nutrisi",
                      attributes: ["name", "unit"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({ success: true, data: updatedFeed });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error("Error updating daily feed:", error);
    return res
      .status(500)
      .json({ message: "Gagal memperbarui daily feed", error: error.message });
  }
};

// **DELETE (Hapus Daily Feed)**
exports.deleteDailyFeed = async (req, res) => {
  const { id } = req.params;
  let t = await sequelize.transaction();

  try {
    const feed = await DailyFeedSchedule.findByPk(id, { transaction: t });
    if (!feed) {
      await t.rollback();
      return res.status(404).json({ message: "Daily feed tidak ditemukan" });
    }

    await feed.destroy({ transaction: t });
    await t.commit();

    return res
      .status(200)
      .json({ success: true, message: "Daily feed berhasil dihapus" });
  } catch (error) {
    if (t && !t.finished) {
      t.rollback();
    }
    console.error("Error deleting daily feed:", error);
    return res
      .status(500)
      .json({ message: "Gagal menghapus daily feed", error: error.message });
  }
};

// **SEARCH (Pencarian Daily Feed dengan Filter Tanggal)**
exports.searchDailyFeeds = async (req, res) => {
  try {
    const { cow_id, start_date, end_date, session } = req.query;
    const filter = {};

    if (cow_id) filter.cow_id = cow_id;
    if (session) filter.session = session;
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date[Op.gte] = start_date;
      if (end_date) filter.date[Op.lte] = end_date;
    }

    const feeds = await DailyFeedSchedule.findAll({
      where: filter,
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["id", "name", "price"],
              include: [
                {
                  model: FeedNutrisi,
                  as: "FeedNutrisi",
                  include: [
                    {
                      model: Nutrisi,
                      as: "Nutrisi",
                      attributes: ["name", "unit"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res
      .status(200)
      .json({ success: true, count: feeds.length, data: feeds });
  } catch (error) {
    console.error("Error searching daily feeds:", error);
    return res
      .status(500)
      .json({ message: "Gagal mencari daily feeds", error: error.message });
  }
};
