const Feed = require("../models/feedModel");
const FeedType = require("../models/feedTypeModel");
const Nutrisi = require("../models/nutritionModel");
const FeedNutrisi = require("../models/feedNutritionModel");
const { Op } = require("sequelize");

const handleError = (res, error, status = 500) => {
  console.error("Error:", error);
  return res.status(status).json({
    success: false,
    error: error.message || "Server error",
  });
};

const validateModels = () => {
  if (!Feed || !FeedType || !Nutrisi || !FeedNutrisi) {
    throw new Error("One or more models are not properly defined");
  }
};

const createFeed = async (req, res) => {
  try {
    validateModels();

    const { typeId, name, min_stock, price, nutrisiList } = req.body;

    if (!typeId || !name || min_stock === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        error: "typeId, name, min_stock, and price are required",
      });
    }

    // Check for duplicate feed name (case-insensitive)
    const existingFeed = await Feed.findOne({
      where: {
        name: { [Op.like]: name.trim() }, // Use Op.like for MySQL
      },
    });
    if (existingFeed) {
      return res.status(400).json({
        success: false,
        error: `Pakan ${name} sudah ada, silahkan tambahkan yang lain`,
      });
    }

    const feedType = await FeedType.findByPk(typeId);
    if (!feedType) {
      return res.status(404).json({ success: false, error: "Feed type not found" });
    }

    const feed = await Feed.create({ typeId, name: name.trim(), min_stock, price });

    if (nutrisiList && Array.isArray(nutrisiList)) {
      const nutritions = await Nutrisi.findAll({
        where: { id: { [Op.in]: nutrisiList.map(n => n.nutrisi_id) } },
      });

      if (nutritions.length !== nutrisiList.length) {
        return res.status(404).json({ success: false, error: "One or more nutritions not found" });
      }

      const feedNutrisiData = nutrisiList.map(n => ({
        feed_id: feed.id,
        nutrisi_id: n.nutrisi_id,
        amount: n.amount || 0.0,
      }));

      await FeedNutrisi.bulkCreate(feedNutrisiData);
    }

    const createdFeed = await Feed.findByPk(feed.id, {
      include: [
        { model: FeedType, as: "FeedType" },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi" }],
        },
      ],
    });

    return res.status(201).json({ success: true, data: createdFeed });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAllFeeds = async (req, res) => {
  try {
    const { typeId, name } = req.query;
    const filter = {};
    if (typeId) filter.typeId = typeId;
    if (name) filter.name = { [Op.like]: `%${name}%` }; // Use Op.like for MySQL

    const feeds = await Feed.findAll({
      where: filter,
      include: [
        { model: FeedType, as: "FeedType", attributes: ["id", "name"] },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({ success: true, count: feeds.length, data: feeds });
  } catch (error) {
    return handleError(res, error);
  }
};

const getFeedById = async (req, res) => {
  try {
    const { id } = req.params;

    const feed = await Feed.findByPk(id, {
      include: [
        { model: FeedType, as: "FeedType", attributes: ["id", "name"] },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
        },
      ],
    });

    if (!feed) {
      return res.status(404).json({ success: false, message: "Pakan tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: feed });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateFeed = async (req, res) => {
  try {
    validateModels();
    const { id } = req.params;
    const { typeId, name, min_stock, price, nutrisiList } = req.body;

    const feed = await Feed.findByPk(id);
    if (!feed) return res.status(404).json({ success: false, error: "Feed not found" });

    // Check for duplicate feed name (case-insensitive), excluding the current feed
    if (name && name.trim() !== feed.name) {
      const existingFeed = await Feed.findOne({
        where: {
          name: { [Op.like]: name.trim() }, // Use Op.like for MySQL
          id: { [Op.ne]: id }, // Exclude the current feed
        },
      });
      if (existingFeed) {
        return res.status(400).json({
          success: false,
          error: `Pakan ${name} sudah ada, silahkan tambahkan yang lain`,
        });
      }
    }

    if (typeId) {
      const feedType = await FeedType.findByPk(typeId);
      if (!feedType) return res.status(404).json({ success: false, error: "Feed type not found" });
    }

    await feed.update({
      typeId: typeId || feed.typeId,
      name: name ? name.trim() : feed.name,
      min_stock: min_stock !== undefined ? min_stock : feed.min_stock,
      price: price !== undefined ? price : feed.price,
    });

    if (nutrisiList && Array.isArray(nutrisiList)) {
      await FeedNutrisi.destroy({ where: { feed_id: id } });

      const nutritions = await Nutrisi.findAll({
        where: { id: { [Op.in]: nutrisiList.map(n => n.nutrisi_id) } },
      });

      if (nutritions.length !== nutrisiList.length) {
        return res.status(404).json({ success: false, error: "One or more nutritions not found" });
      }

      const feedNutrisiData = nutrisiList.map(n => ({
        feed_id: id,
        nutrisi_id: n.nutrisi_id,
        amount: n.amount || 0.0,
      }));

      await FeedNutrisi.bulkCreate(feedNutrisiData);
    }

    const updatedFeed = await Feed.findByPk(id, {
      include: [
        { model: FeedType, as: "FeedType" },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi" }],
        },
      ],
    });

    return res.status(200).json({ success: true, data: updatedFeed });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteFeed = async (req, res) => {
  try {
    validateModels();
    const { id } = req.params;

    const feed = await Feed.findByPk(id);
    if (!feed) return res.status(404).json({ success: false, error: "Feed not found" });

    await feed.destroy();
    return res.status(200).json({ success: true, message: "Feed deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createFeed,
  getAllFeeds,
  getFeedById,
  updateFeed,
  deleteFeed,
};