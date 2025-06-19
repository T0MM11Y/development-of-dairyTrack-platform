// controllers/dailyFeedController.js
const axios = require("axios");
const DailyFeedSchedule = require("../models/dailyFeedSchedule");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");
const Nutrisi = require("../models/nutritionModel");
const FeedNutrisi = require("../models/feedNutritionModel");
const User = require("../models/userModel");
const Cow = require("../models/cowModel");
const UserCowAssociation = require("../models/userCowAssociationModel");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const NodeCache = require("node-cache");

const weatherCache = new NodeCache({ stdTTL: 3600 });

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "0c8e3b7192a29e0bb20925d0d3f4753b";
const LATITUDE = process.env.WEATHER_LATITUDE || "2.288682100442301";
const LONGITUDE = process.env.WEATHER_LONGITUDE || "98.62536951589614";

// Helper function to format response
const formatFeedResponse = (feed) => ({
  id: feed.id,
  cow_id: feed.cow_id,
  cow_name: feed.Cow ? feed.Cow.name : null,
  date: feed.date,
  session: feed.session,
  weather: feed.weather,
  total_nutrients: feed.total_nutrients,
  user_id: feed.user_id,
  user_name: feed.User ? feed.User.name : null,
  created_by: feed.Creator ? { id: feed.Creator.id, name: feed.Creator.name } : null,
  updated_by: feed.Updater ? { id: feed.Updater.id, name: feed.Updater.name } : null,
  created_at: feed.createdAt,
  updated_at: feed.updatedAt,
  items: feed.DailyFeedItems
    ? feed.DailyFeedItems.map((item) => ({
        id: item.id,
        feed_id: item.feed_id,
        feed_name: item.Feed ? item.Feed.name : null,
        quantity: parseFloat(item.quantity),
        price: item.Feed ? parseFloat(item.Feed.price) : null,
        nutrients: item.Feed?.FeedNutrisiRecords
          ? item.Feed.FeedNutrisiRecords.map((n) => ({
              nutrisi_id: n.nutrisi_id,
              nutrisi_name: n.Nutrisi ? n.Nutrisi.name : null,
              unit: n.Nutrisi ? n.Nutrisi.unit : null,
              amount: parseFloat(n.amount),
            }))
          : [],
      }))
    : [],
});

// Get current weather
const getCurrentWeather = async () => {
  if (!WEATHER_API_KEY) {
    console.error("Weather API key is not configured");
    return "Tidak diketahui";
  }

  const cacheKey = `weather_${LATITUDE}_${LONGITUDE}`;
  const cachedWeather = weatherCache.get(cacheKey);

  if (cachedWeather) {
    return cachedWeather;
  }

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${WEATHER_API_KEY}&units=metric&lang=id`;
    const response = await axios.get(apiUrl);
    const weatherDescription = response.data.weather[0].description;
    weatherCache.set(cacheKey, weatherDescription);
    return weatherDescription;
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return "Tidak diketahui";
  }
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  // Check if date is valid and matches the input (to handle cases like "2025-13-01")
  return (
    !isNaN(date.getTime()) &&
    dateString === date.toISOString().split("T")[0]
  );
};

// Calculate total nutrients
const calculateTotalNutrients = async (items, transaction) => {
  console.log(`Calculating total nutrients for ${items.length} feed items`);
  const nutrientTotals = {};

  for (const item of items) {
    const feed = await Feed.findByPk(item.feed_id, {
      include: [
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          attributes: ["nutrisi_id", "amount"],
          include: [
            { model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] },
          ],
        },
      ],
      transaction,
    });

    if (!feed) {
      console.warn(`Feed not found for feed_id: ${item.feed_id}`);
      continue;
    }

    if (!feed.FeedNutrisiRecords || feed.FeedNutrisiRecords.length === 0) {
      console.warn(`No nutrient records found for feed_id: ${item.feed_id} (${feed.name})`);
      continue;
    }

    feed.FeedNutrisiRecords.forEach((nutrisi) => {
      if (!nutrisi.Nutrisi) {
        console.warn(`Nutrisi not found for nutrisi_id: ${nutrisi.nutrisi_id}`);
        return;
      }

      const nutrientId = nutrisi.Nutrisi.id;
      const nutrientName = nutrisi.Nutrisi.name;
      const nutrientUnit = nutrisi.Nutrisi.unit;
      const amountPerKg = parseFloat(nutrisi.amount); // g/kg
      const quantityKg = parseFloat(item.quantity); // kg
      const nutrientValue = amountPerKg * quantityKg; // g

      if (isNaN(nutrientValue)) {
        console.warn(
          `Invalid nutrient calculation for feed_id: ${item.feed_id}, nutrisi_id: ${nutrientId}, amount: ${nutrisi.amount}, quantity: ${item.quantity}`
        );
        return;
      }

      if (!nutrientTotals[nutrientId]) {
        nutrientTotals[nutrientId] = {
          id: nutrientId,
          name: nutrientName,
          unit: nutrientUnit,
          total: 0,
        };
      }
      nutrientTotals[nutrientId].total += nutrientValue;

      console.log(
        `Accumulated ${nutrientValue} ${nutrientUnit} of ${nutrientName} for feed_id: ${item.feed_id} (quantity: ${quantityKg} kg)`
      );
    });
  }

  const totalNutrients = Object.values(nutrientTotals).map((n) => ({
    id: n.id,
    name: n.name,
    unit: n.unit,
    total: parseFloat(n.total.toFixed(2)),
  }));

  console.log(`Calculated total_nutrients: ${JSON.stringify(totalNutrients)}`);
  return totalNutrients;
};

// Create daily feed
exports.createDailyFeed = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { cow_id, date, session, items = [] } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
    }

    if (!cow_id || !date || !session) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Harap lengkapi cow_id, date, dan session." });
    }

    // Check date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Format tanggal harus YYYY-MM-DD." });
    }

    // Check if date is valid
    if (!isValidDate(date)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Tanggal tidak valid. Periksa tahun, bulan, atau hari." });
    }

    if (!["Pagi", "Siang", "Sore"].includes(session)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Session harus Pagi, Siang, atau Sore." });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: `User dengan ID ${userId} tidak ditemukan.` });
    }

    const cow = await Cow.findByPk(cow_id, { transaction });
    if (!cow) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: `Sapi dengan ID ${cow_id} tidak ditemukan.` });
    }

    const userCowAssociation = await UserCowAssociation.findOne({
      where: { user_id: userId, cow_id },
      transaction,
    });
    if (!userCowAssociation) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: `Anda tidak memiliki izin untuk mengelola sapi dengan ID ${cow_id}.` });
    }

    const existingFeed = await DailyFeedSchedule.findOne({
      where: { cow_id, date, session },
      transaction,
    });

    if (existingFeed) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: `Jadwal pakan untuk sapi ${cow.name} pada ${date} sesi ${session} sudah ada.`,
        existing: formatFeedResponse(existingFeed),
      });
    }

    if (items.length > 0) {
      for (const item of items) {
        if (!item.feed_id || !item.quantity || item.quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: "Setiap item harus memiliki feed_id dan quantity yang valid." });
        }
        const feed = await Feed.findByPk(item.feed_id, { transaction });
        if (!feed) {
          await transaction.rollback();
          return res.status(404).json({ success: false, message: `Pakan dengan ID ${item.feed_id} tidak ditemukan.` });
        }
      }
    }

    const weather = await getCurrentWeather();

    const newFeed = await DailyFeedSchedule.create(
      {
        cow_id,
        date,
        session,
        weather,
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      },
      { transaction }
    );

    let totalNutrients = [];
    if (items.length > 0) {
      const feedItems = items.map((item) => ({
        daily_feed_id: newFeed.id,
        feed_id: item.feed_id,
        quantity: parseFloat(item.quantity),
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      }));

      await DailyFeedItems.bulkCreate(feedItems, { transaction, validate: true, userId });

      totalNutrients = await calculateTotalNutrients(feedItems, transaction);
      await newFeed.update({ total_nutrients: totalNutrients }, { transaction });
    }

    const createdFeed = await DailyFeedSchedule.findByPk(newFeed.id, {
      include: [
        { model: DailyFeedItems, as: "DailyFeedItems", include: [{ model: Feed, as: "Feed", attributes: ["id", "name", "price"], include: [{ model: FeedNutrisi, as: "FeedNutrisiRecords", include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }] }] }] },
        { model: Cow, as: "Cow", attributes: ["id", "name"] },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
      transaction,
    });

    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: `Jadwal pakan untuk sapi ${createdFeed.Cow.name} pada ${date} sesi ${session} berhasil dibuat${items.length > 0 ? ` dengan ${items.length} item.` : "."}`,
      data: formatFeedResponse(createdFeed),
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating daily feed:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: `Validasi gagal: ${error.errors.map(e => e.message).join(", ")}` });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ success: false, message: "Data tidak valid: sapi atau user tidak ditemukan." });
    }
    if (error.name === "SequelizeDatabaseError" && error.message.includes("invalid input syntax for type date")) {
      return res.status(400).json({ success: false, message: "Tanggal tidak valid. Periksa format atau keberadaan tanggal." });
    }
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};
// Update daily feed
exports.updateDailyFeed = async (req, res) => {
  const { id } = req.params;
  const { cow_id, date, session, items = [] } = req.body;
  const userId = req.user?.id;
  const transaction = await sequelize.transaction();

  try {
    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
    }

    const feed = await DailyFeedSchedule.findByPk(id, { transaction });
    if (!feed) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Jadwal pakan tidak ditemukan." });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: `User dengan ID ${userId} tidak ditemukan.` });
    }

    const targetCowId = cow_id || feed.cow_id;
    const cow = await Cow.findByPk(targetCowId, { transaction });
    if (!cow) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: `Sapi dengan ID ${targetCowId} tidak ditemukan.` });
    }

    const userCowAssociation = await UserCowAssociation.findOne({
      where: { user_id: userId, cow_id: targetCowId },
      transaction,
    });
    if (!userCowAssociation) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: `Anda tidak memiliki izin untuk mengelola sapi dengan ID ${targetCowId}.` });
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Format tanggal harus YYYY-MM-DD." });
    }

    // Check if date is valid
    if (date && !isValidDate(date)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Tanggal tidak valid. Periksa tahun, bulan, atau hari." });
    }

    if (session && !["Pagi", "Siang", "Sore"].includes(session)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Session harus Pagi, Siang, atau Sore." });
    }

    const checkFields = {
      cow_id: targetCowId,
      date: date || feed.date,
      session: session || feed.session,
    };

    const existingFeed = await DailyFeedSchedule.findOne({
      where: { cow_id: checkFields.cow_id, date: checkFields.date, session: checkFields.session, id: { [Op.ne]: id } },
      transaction,
    });

    if (existingFeed) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: `Jadwal pakan untuk sapi ${cow.name} pada ${checkFields.date} sesi ${checkFields.session} sudah ada.`,
        existing: formatFeedResponse(existingFeed),
      });
    }

    if (items.length > 0) {
      for (const item of items) {
        if (!item.feed_id || !item.quantity || item.quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: "Setiap item harus memiliki feed_id dan quantity yang valid." });
        }
        const feedItem = await Feed.findByPk(item.feed_id, { transaction });
        if (!feedItem) {
          await transaction.rollback();
          return res.status(404).json({ success: false, message: `Pakan dengan ID ${item.feed_id} tidak ditemukan.` });
        }
      }
    }

    await feed.update(
      {
        cow_id: targetCowId,
        date: date || feed.date,
        session: session || feed.session,
        weather: await getCurrentWeather(),
        updated_by: userId,
      },
      { transaction }
    );

    let totalNutrients = [];
    if (items.length > 0) {
      await DailyFeedItems.destroy({ where: { daily_feed_id: id }, transaction });

      const feedItems = items.map((item) => ({
        daily_feed_id: id,
        feed_id: item.feed_id,
        quantity: parseFloat(item.quantity),
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      }));

      await DailyFeedItems.bulkCreate(feedItems, { transaction, validate: true, userId });

      totalNutrients = await calculateTotalNutrients(feedItems, transaction);
      await feed.update({ total_nutrients: totalNutrients }, { transaction });
    } else {
      // If no items, clear total_nutrients
      await feed.update({ total_nutrients: [] }, { transaction });
    }

    const updatedFeed = await DailyFeedSchedule.findByPk(id, {
      include: [
        { model: DailyFeedItems, as: "DailyFeedItems", include: [{ model: Feed, as: "Feed", attributes: ["id", "name", "price"], include: [{ model: FeedNutrisi, as: "FeedNutrisiRecords", include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }] }] }] },
        { model: Cow, as: "Cow", attributes: ["id", "name"] },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
      transaction,
    });

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: `Jadwal pakan untuk sapi ${updatedFeed.Cow.name} pada ${updatedFeed.date} sesi ${updatedFeed.session} berhasil diperbarui${items.length > 0 ? ` dengan ${items.length} item.` : "."}`,
      data: formatFeedResponse(updatedFeed),
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating daily feed:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: `Validasi gagal: ${error.errors.map(e => e.message).join(", ")}` });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ success: false, message: "Data tidak valid: sapi atau user tidak ditemukan." });
    }
    if (error.name === "SequelizeDatabaseError" && error.message.includes("invalid input syntax for type date")) {
      return res.status(400).json({ success: false, message: "Tanggal tidak valid. Periksa format atau keberadaan tanggal." });
    }
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// Get all daily feeds
exports.getAllDailyFeeds = async (req, res) => {
  try {
    const { cow_id, date, session } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase(); // Ambil peran pengguna

    if (!userId) {
      return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
    }

    const filter = {};
    if (cow_id) filter.cow_id = cow_id;
    if (date) filter.date = date;
    if (session) filter.session = session;

    // Hanya terapkan filter UserCowAssociation untuk farmer
    if (userRole === "farmer") {
      const userCows = await UserCowAssociation.findAll({ where: { user_id: userId }, attributes: ["cow_id"] });
      const allowedCowIds = userCows.map((uc) => uc.cow_id);
      filter.cow_id = allowedCowIds.length > 0 ? { [Op.in]: allowedCowIds } : { [Op.eq]: null };
    }

    const feeds = await DailyFeedSchedule.findAll({
      where: filter,
      include: [
        { model: DailyFeedItems, as: "DailyFeedItems", include: [{ model: Feed, as: "Feed", attributes: ["id", "name", "price"], include: [{ model: FeedNutrisi, as: "FeedNutrisiRecords", include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }] }] }] },
        { model: Cow, as: "Cow", attributes: ["id", "name"] },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
      order: [["date", "DESC"], ["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: feeds.length,
      data: feeds.map(formatFeedResponse),
    });
  } catch (error) {
    console.error("Error fetching daily feeds:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// Get daily feed by ID
exports.getDailyFeedById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role?.toLowerCase();

  if (!userId) {
    return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
  }

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "ID tidak valid." });
  }

  try {
    const feed = await DailyFeedSchedule.findByPk(id, {
      include: [
        { model: DailyFeedItems, as: "DailyFeedItems", include: [{ model: Feed, as: "Feed", attributes: ["id", "name", "price"], include: [{ model: FeedNutrisi, as: "FeedNutrisiRecords", include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }] }] }] },
        { model: Cow, as: "Cow", attributes: ["id", "name"] },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    if (!feed) {
      return res.status(404).json({ success: false, message: "Jadwal pakan tidak ditemukan." });
    }

    // Hanya terapkan pengecekan UserCowAssociation untuk farmer
    if (userRole === "farmer") {
      const userCowAssociation = await UserCowAssociation.findOne({
        where: { user_id: userId, cow_id: feed.cow_id },
      });
      if (!userCowAssociation) {
        return res.status(403).json({ success: false, message: `Anda tidak memiliki izin untuk melihat jadwal pakan sapi dengan ID ${feed.cow_id}.` });
      }
    }

    return res.status(200).json({ success: true, data: formatFeedResponse(feed) });
  } catch (error) {
    console.error("Error fetching daily feed:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// Delete daily feed
exports.deleteDailyFeed = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const transaction = await sequelize.transaction();

  try {
    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
    }

    const feed = await DailyFeedSchedule.findByPk(id, { transaction });
    if (!feed) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Jadwal pakan tidak ditemukan." });
    }

    const userCowAssociation = await UserCowAssociation.findOne({
      where: { user_id: userId, cow_id: feed.cow_id },
      transaction,
    });
    if (!userCowAssociation) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: `Anda tidak memiliki izin untuk menghapus jadwal pakan sapi dengan ID ${feed.cow_id}.` });
    }

    const cow = await Cow.findByPk(feed.cow_id, { transaction });
    await feed.destroy({ transaction });
    await transaction.commit();

    return res.status(200).json({ success: true, message: `Jadwal pakan untuk sapi ${cow.name} pada ${feed.date} sesi ${feed.session} berhasil dihapus.` });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting daily feed:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// Search daily feeds
exports.searchDailyFeeds = async (req, res) => {
  try {
    const { cow_id, start_date, end_date, session } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
    }

    const filter = {};
    if (cow_id) filter.cow_id = cow_id;
    if (session) filter.session = session;
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date[Op.gte] = start_date;
      if (end_date) filter.date[Op.lte] = end_date;
    }

    // Restrict to cows managed by the user
    const userCows = await UserCowAssociation.findAll({ where: { user_id: userId }, attributes: ["cow_id"] });
    const allowedCowIds = userCows.map((uc) => uc.cow_id);
    filter.cow_id = allowedCowIds.length > 0 ? { [Op.in]: allowedCowIds } : { [Op.eq]: null };

    const feeds = await DailyFeedSchedule.findAll({
      where: filter,
      include: [
        { model: DailyFeedItems, as: "DailyFeedItems", include: [{ model: Feed, as: "Feed", attributes: ["id", "name", "price"], include: [{ model: FeedNutrisi, as: "FeedNutrisiRecords", include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }] }] }] },
        { model: Cow, as: "Cow", attributes: ["id", "name"] },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
      order: [["date", "DESC"], ["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: feeds.length,
      data: feeds.map(formatFeedResponse),
    });
  } catch (error) {
    console.error("Error searching daily feeds:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};