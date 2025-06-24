const Feed = require("../models/feedModel");
const FeedType = require("../models/feedTypeModel");
const Nutrisi = require("../models/nutritionModel");
const FeedNutrisi = require("../models/feedNutritionModel");
const User = require("../models/userModel");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

// Helper function to format Feed response
const formatFeedResponse = (feed) => ({
  id: feed.id,
  type_id: feed.typeId,
  type_name: feed.FeedType ? feed.FeedType.name : null,
  name: feed.name,
  unit: feed.unit,
  min_stock: feed.min_stock,
  price: feed.price,
  user_id: feed.user_id,
  user_name: feed.User ? feed.User.name : null,
  created_by: feed.Creator ? { id: feed.Creator.id, name: feed.Creator.name } : null,
  updated_by: feed.Updater ? { id: feed.Updater.id, name: feed.Updater.name } : null,
  created_at: feed.createdAt,
  updated_at: feed.updatedAt,
  deleted_at: feed.deletedAt, // Opsional untuk debugging atau admin
  nutrisi_records: feed.FeedNutrisiRecords
    ? feed.FeedNutrisiRecords.map((record) => ({
        nutrisi_id: record.nutrisi_id,
        nutrisi_name: record.Nutrisi ? record.Nutrisi.name : null,
        unit: record.Nutrisi ? record.Nutrisi.unit : null,
        amount: record.amount,
      }))
    : [],
});

// Handle errors consistently
const handleError = (res, error, status = 500) => {
  console.error("Error:", error);
  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
  });
};

// Validate model definitions
const validateModels = () => {
  if (!Feed || !FeedType || !Nutrisi || !FeedNutrisi || !User) {
    throw new Error("One or more models are not properly defined");
  }
};

const createFeed = async (req, res) => {
  try {
    validateModels();
    const { typeId, name, unit, min_stock, price, nutrisiList } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    if (!name || !unit || min_stock === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Harap lengkapi semua field wajib: nama, unit, stok minimum, dan harga.",
      });
    }

    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan.`,
      });
    }

    const existingFeed = await Feed.findOne({
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), name.trim().toLowerCase()),
    });
    if (existingFeed) {
      return res.status(400).json({
        success: false,
        message: `Pakan dengan nama "${name.trim()}" sudah ada. Silakan gunakan nama lain.`,
      });
    }

    let feedType = null;
    if (typeId) {
      feedType = await FeedType.findByPk(typeId);
      if (!feedType) {
        return res.status(404).json({
          success: false,
          message: "Jenis pakan tidak ditemukan.",
        });
      }
    }

    const feed = await Feed.create({
      typeId,
      name: name.trim(),
      unit,
      min_stock,
      price,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
    });

    let nutrisiRecordsCreated = [];
    if (nutrisiList && Array.isArray(nutrisiList) && nutrisiList.length > 0) {
      const nutrisiIds = nutrisiList.map((n) => n.nutrisi_id);
      const nutritions = await Nutrisi.findAll({
        where: { id: { [Op.in]: nutrisiIds } },
      });

      if (nutritions.length !== nutrisiList.length) {
        return res.status(400).json({
          success: false,
          message: "Satu atau lebih nutrisi tidak ditemukan. Periksa nutrisi_id.",
        });
      }

      const feedNutrisiData = nutrisiList.map((n) => ({
        feed_id: feed.id,
        nutrisi_id: n.nutrisi_id,
        amount: n.amount || 0.0,
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      }));

      nutrisiRecordsCreated = await FeedNutrisi.bulkCreate(feedNutrisiData, {
        validate: true,
      });
    }

    const createdFeed = await Feed.findByPk(feed.id, {
      include: [
        { model: FeedType, as: "FeedType", attributes: ["id", "name"] },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
        },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    if (!createdFeed) {
      return res.status(404).json({
        success: false,
        message: "Pakan gagal ditemukan setelah pembuatan.",
      });
    }

    return res.status(201).json({
      success: true,
      message: `Pakan "${name.trim()}" berhasil ditambahkan${nutrisiRecordsCreated.length > 0 ? ` dengan ${nutrisiRecordsCreated.length} nutrisi.` : "."}`,
      data: formatFeedResponse(createdFeed),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Pakan dengan nama "${req.body.name}" sudah ada. Silakan gunakan nama lain.`,
      });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid: user atau jenis pakan tidak ditemukan.",
      });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validasi gagal: ${error.errors.map(e => e.message).join(", ")}`,
      });
    }
    return handleError(res, error);
  }
};

const getAllFeeds = async (req, res) => {
  try {
    const { typeId, name } = req.query;
    const filter = {};
    if (typeId) filter.typeId = typeId;
    if (name) {
      filter.name = Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), {
        [Op.like]: `%${name.toLowerCase()}%`,
      });
    }

    const feeds = await Feed.findAll({
      where: filter,
      include: [
        { model: FeedType, as: "FeedType", attributes: ["id", "name"] },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
        },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
      order: [["name", "ASC"]],
    });

    const formattedFeeds = feeds.map(formatFeedResponse);

    return res.status(200).json({
      success: true,
      count: feeds.length,
      data: formattedFeeds,
    });
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
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Pakan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatFeedResponse(feed),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateFeed = async (req, res) => {
  try {
    validateModels();
    const { id } = req.params;
    const { typeId, name, unit, min_stock, price, nutrisiList } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    const feed = await Feed.findByPk(id);
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Pakan tidak ditemukan.",
      });
    }

    const user = await User.findByPk(userId, { attributes: ["id"] });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan.`,
      });
    }

    if (name && name.trim() !== feed.name) {
      const existingFeed = await Feed.findOne({
        where: {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), name.trim().toLowerCase()),
            { id: { [Op.ne]: id } },
          ],
        },
      });
      if (existingFeed) {
        return res.status(400).json({
          success: false,
          message: `Pakan dengan nama "${name.trim()}" sudah ada. Silakan gunakan nama lain.`,
        });
      }
    }

    let feedType = null;
    if (typeId && typeId !== feed.typeId) {
      feedType = await FeedType.findByPk(typeId);
      if (!feedType) {
        return res.status(404).json({
          success: false,
          message: "Jenis pakan tidak ditemukan.",
        });
      }
    }

    await feed.update({
      typeId: typeId || feed.typeId,
      name: name ? name.trim() : feed.name,
      unit: unit || feed.unit,
      min_stock: min_stock !== undefined ? min_stock : feed.min_stock,
      price: price !== null ? price : feed.price,
      user_id: userId,
      updated_by: userId,
    });

    let nutrisiRecordsCreated = [];
    if (nutrisiList && Array.isArray(nutrisiList) && nutrisiList.length > 0) {
      await FeedNutrisi.destroy({ where: { feed_id: id } });

      const nutrisiIds = nutrisiList.map((n) => n.nutrisi_id);
      const nutritions = await Nutrisi.findAll({
        where: { id: { [Op.in]: nutrisiIds } },
      });

      if (nutritions.length !== nutrisiList.length) {
        return res.status(400).json({
          success: false,
          message: "Satu atau lebih nutrisi tidak ditemukan. Periksa nutrisi_id.",
        });
      }

      const feedNutrisiData = nutrisiList.map((n) => ({
        feed_id: id,
        nutrisi_id: n.nutrisi_id,
        amount: n.amount || 0.0,
        user_id: userId,
        created_by: userId,
        updated_by: userId,
      }));

      nutrisiRecordsCreated = await FeedNutrisi.bulkCreate(feedNutrisiData, {
        validate: true,
      });
    }

    const updatedFeed = await Feed.findByPk(id, {
      include: [
        { model: FeedType, as: "FeedType", attributes: ["id", "name"] },
        {
          model: FeedNutrisi,
          as: "FeedNutrisiRecords",
          include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
        },
        { model: User, as: "User", attributes: ["id", "name"] },
        { model: User, as: "Creator", attributes: ["id", "name"] },
        { model: User, as: "Updater", attributes: ["id", "name"] },
      ],
    });

    if (!updatedFeed) {
      return res.status(404).json({
        success: false,
        message: "Pakan tidak ditemukan setelah pembaruan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Pakan "${updatedFeed.name}" berhasil diperbarui${nutrisiRecordsCreated.length > 0 ? ` dengan ${nutrisiRecordsCreated.length} nutrisi.` : "."}`,
      data: formatFeedResponse(updatedFeed),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: `Pakan dengan nama "${req.body.name}" sudah ada. Silakan gunakan nama lain.`,
      });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid: user atau jenis pakan tidak ditemukan.",
      });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validasi gagal: ${error.errors.map(e => e.message).join(", ")}`,
      });
    }
    return handleError(res, error);
  }
};

const deleteFeed = async (req, res) => {
  try {
    const { id } = req.params;

    const feed = await Feed.findByPk(id);
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Pakan tidak ditemukan",
      });
    }

    await feed.destroy();

    return res.status(200).json({
      success: true,
      message: "Pakan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error in deleteFeed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server.",
    });
  }
};

module.exports = {
  createFeed,
  getAllFeeds,
  getFeedById,
  updateFeed,
  deleteFeed,
};