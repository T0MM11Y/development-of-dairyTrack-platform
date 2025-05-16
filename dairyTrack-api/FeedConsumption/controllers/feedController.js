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
    const userId = req.user?.id; // From verifyToken middleware

    // Validate userId
    if (!userId) {
      console.error("Error: userId is undefined or null");
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    // Validate input
    if (!typeId || !name || !unit || min_stock === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Harap lengkapi semua field wajib: typeId, name, unit, min_stock, dan price.",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan.`,
      });
    }

    // Check for duplicate feed name (case-insensitive for MySQL)
    const existingFeed = await Feed.findOne({
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), name.trim().toLowerCase()),
    });
    if (existingFeed) {
      return res.status(400).json({
        success: false,
        message: `Pakan dengan nama "${name}" sudah terdaftar. Gunakan nama lain.`,
      });
    }

    // Validate feed type
    const feedType = await FeedType.findByPk(typeId);
    if (!feedType) {
      return res.status(404).json({
        success: false,
        message: "Jenis pakan tidak ditemukan. Pastikan typeId valid.",
      });
    }

    // Log input data for debugging
    console.log("Creating feed with data:", {
      typeId,
      name: name.trim(),
      unit,
      min_stock,
      price,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
    });

    // Create feed with all fields
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

    console.log("Feed created successfully:", feed.toJSON());

    // Handle nutrisiList if provided
    let nutrisiRecordsCreated = [];
    if (nutrisiList && Array.isArray(nutrisiList) && nutrisiList.length > 0) {
      const nutrisiIds = nutrisiList.map((n) => n.nutrisi_id);
      const nutritions = await Nutrisi.findAll({
        where: { id: { [Op.in]: nutrisiIds } },
      });

      if (nutritions.length !== nutrisiList.length) {
        return res.status(404).json({
          success: false,
          message: "Satu atau lebih nutrisi tidak ditemukan. Periksa nutrisi_id.",
        });
      }

      const feedNutrisiData = nutrisiList.map((n) => ({
        feed_id: feed.id,
        nutrisi_id: n.nutrisi_id,
        amount: n.amount || 0.0,
        user_id: userId, // Add required user_id
        created_by: userId, // Add required created_by
        updated_by: userId, // Add required updated_by
      }));

      console.log("FeedNutrisi data to create:", feedNutrisiData);

      nutrisiRecordsCreated = await FeedNutrisi.bulkCreate(feedNutrisiData, {
        validate: true, // Ensure validation is applied
      });

      console.log("FeedNutrisi records created:", nutrisiRecordsCreated.map(r => r.toJSON()));
    }

    // Fetch complete feed data with associations
    let createdFeed;
    try {
      createdFeed = await Feed.findByPk(feed.id, {
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
        console.error("Error: Created feed not found in findByPk:", feed.id);
        return res.status(404).json({
          success: false,
          message: "Pakan gagal ditemukan setelah pembuatan.",
        });
      }
    } catch (findError) {
      console.error("Error in findByPk after creation:", findError);
      // Fallback to basic feed data if associations fail
      createdFeed = feed;
    }

    return res.status(201).json({
      success: true,
      message: `Pakan "${name}" berhasil ditambahkan${nutrisiRecordsCreated.length > 0 ? ` dengan ${nutrisiRecordsCreated.length} nutrisi.` : "."}`,
      data: formatFeedResponse(createdFeed),
    });
  } catch (error) {
    console.error("Error in createFeed:", error);
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Pakan dengan nama "${req.body.name}" sudah terdaftar. Gunakan nama lain.`,
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
    const userId = req.user?.id; // From verifyToken middleware

    // Validate userId
    if (!userId) {
      console.error("Error: userId is undefined or null");
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

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User dengan ID ${userId} tidak ditemukan.`,
      });
    }

    // Check for duplicate feed name (case-insensitive), excluding current feed
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
          message: `Pakan dengan nama "${name}" sudah terdaftar. Gunakan nama lain.`,
        });
      }
    }

    // Validate feed type if provided
    if (typeId) {
      const feedType = await FeedType.findByPk(typeId);
      if (!feedType) {
        return res.status(404).json({
          success: false,
          message: "Jenis pakan tidak ditemukan. Pastikan typeId valid.",
        });
      }
    }

    // Update feed with all fields
    await feed.update({
      typeId: typeId || feed.typeId,
      name: name ? name.trim() : feed.name,
      unit: unit || feed.unit,
      min_stock: min_stock !== undefined ? min_stock : feed.min_stock,
      price: price !== undefined ? price : feed.price,
      user_id: userId,
      updated_by: userId,
    });

    // Handle nutrisiList if provided
    let nutrisiRecordsCreated = [];
    if (nutrisiList && Array.isArray(nutrisiList) && nutrisiList.length > 0) {
      await FeedNutrisi.destroy({ where: { feed_id: id } });

      const nutrisiIds = nutrisiList.map((n) => n.nutrisi_id);
      const nutritions = await Nutrisi.findAll({
        where: { id: { [Op.in]: nutrisiIds } },
      });

      if (nutritions.length !== nutrisiList.length) {
        return res.status(404).json({
          success: false,
          message: "Satu atau lebih nutrisi tidak ditemukan. Periksa nutrisi_id.",
        });
      }

      const feedNutrisiData = nutrisiList.map((n) => ({
        feed_id: id,
        nutrisi_id: n.nutrisi_id,
        amount: n.amount || 0.0,
        user_id: userId, // Add required user_id
        created_by: userId, // Add required created_by
        updated_by: userId, // Add required updated_by
      }));

      console.log("FeedNutrisi data to update:", feedNutrisiData);

      nutrisiRecordsCreated = await FeedNutrisi.bulkCreate(feedNutrisiData, {
        validate: true,
      });

      console.log("FeedNutrisi records updated:", nutrisiRecordsCreated.map(r => r.toJSON()));
    }

    // Fetch updated feed with associations
    let updatedFeed;
    try {
      updatedFeed = await Feed.findByPk(id, {
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
    } catch (findError) {
      console.error("Error in findByPk after update:", findError);
      updatedFeed = feed;
    }

    return res.status(200).json({
      success: true,
      message: `Pakan "${updatedFeed.name}" berhasil diperbarui${nutrisiRecordsCreated.length > 0 ? ` dengan ${nutrisiRecordsCreated.length} nutrisi.` : "."}`,
      data: formatFeedResponse(updatedFeed),
    });
  } catch (error) {
    console.error("Error in updateFeed:", error);
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: `Pakan dengan nama "${req.body.name}" sudah terdaftar. Gunakan nama lain.`,
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
    validateModels();
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