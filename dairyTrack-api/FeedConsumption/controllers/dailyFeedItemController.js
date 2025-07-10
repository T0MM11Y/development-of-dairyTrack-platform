const DailyFeedSchedule = require("../models/dailyFeedSchedule");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");
const FeedStock = require("../models/feedStockModel");
const FeedNutrisi = require("../models/feedNutritionModel");
const Nutrisi = require("../models/nutritionModel");
const UserCowAssociation = require("../models/userCowAssociationModel");
const User = require("../models/userModel");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const formatFeedItemResponse = (item) => ({
  id: item.id,
  daily_feed_id: item.daily_feed_id,
  feed_id: item.feed_id,
  feed_name: item.Feed ? item.Feed.name : null,
  quantity: parseFloat(item.quantity) || 0,
  user_id: item.user_id,
  created_by: item.Creator ? { id: item.Creator.id, name: item.Creator.name } : null,
  updated_by: item.Updater ? { id: item.Updater.id, name: item.Updater.name } : null,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
  deleted_at: item.deletedAt,
  nutrients: item.Feed?.FeedNutrisiRecords
    ? item.Feed.FeedNutrisiRecords.map((n) => ({
        nutrisi_id: n.nutrisi_id,
        nutrisi_name: n.Nutrisi ? n.Nutrisi.name : null,
        unit: n.Nutrisi ? n.Nutrisi.unit : null,
        amount: parseFloat(n.amount) || 0,
      }))
    : [],
});

exports.addFeedItem = async (req, res) => {
  const { daily_feed_id, feed_items } = req.body;
  const userId = req.user?.id;
  let transaction;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    if (!daily_feed_id || !Array.isArray(feed_items) || feed_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "daily_feed_id dan feed_items (array non-kosong) diperlukan",
      });
    }

    const dailyFeed = await DailyFeedSchedule.findByPk(daily_feed_id, {
      include: [{ model: DailyFeedItems, as: "DailyFeedItems" }],
    });
    if (!dailyFeed) {
      return res.status(404).json({
        success: false,
        message: "Sesi pakan harian tidak ditemukan",
      });
    }

    const userCowAssociation = await UserCowAssociation.findOne({
      where: { user_id: userId, cow_id: dailyFeed.cow_id },
    });
    if (!userCowAssociation) {
      return res.status(403).json({
        success: false,
        message: `Anda tidak memiliki izin untuk mengelola pakan sapi dengan ID ${dailyFeed.cow_id}`,
      });
    }

    transaction = await sequelize.transaction();

    const feedIdsInRequest = feed_items.map((item) => item.feed_id);
    const uniqueFeedIds = [...new Set(feedIdsInRequest)];
    if (feedIdsInRequest.length !== uniqueFeedIds.length) {
      const feedIdCounts = {};
      feedIdsInRequest.forEach((id) => {
        feedIdCounts[id] = (feedIdCounts[id] || 0) + 1;
      });
      const duplicateFeedIds = Object.keys(feedIdCounts)
        .filter((id) => feedIdCounts[id] > 1)
        .map(Number);

      const duplicateFeedNames = await Feed.findAll({
        where: { id: duplicateFeedIds },
        attributes: ["id", "name"],
        transaction,
      });

      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Terdapat jenis pakan yang sama dalam permintaan: ${duplicateFeedNames.map((f) => f.name).join(", ")}`,
        duplicates: duplicateFeedNames.map((f) => ({ id: f.id, name: f.name })),
      });
    }

    const existingFeedIds = dailyFeed.DailyFeedItems
      .filter((item) => !item.deletedAt)
      .map((item) => item.feed_id);
    const softDeletedItems = await DailyFeedItems.findAll({
      where: {
        daily_feed_id,
        feed_id: { [Op.in]: feedIdsInRequest },
        deletedAt: { [Op.ne]: null },
      },
      transaction,
      paranoid: false,
    });

    const feedItems = [];
    const restoredItems = [];

    for (const item of feed_items) {
      const qtyNum = parseFloat(item.quantity);
      if (!item.feed_id || isNaN(qtyNum) || qtyNum <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Item dengan feed_id ${item.feed_id || "tidak diketahui"} memiliki quantity tidak valid`,
        });
      }

      const feed = await Feed.findByPk(item.feed_id, { transaction });
      if (!feed) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Pakan dengan ID ${item.feed_id} tidak ditemukan`,
        });
      }

      if (existingFeedIds.includes(item.feed_id)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Jenis pakan ${feed.name} sudah ada dalam sesi ini`,
          duplicates: [{ id: item.feed_id, name: feed.name }],
        });
      }

      const softDeletedItem = softDeletedItems.find(
        (sdi) => sdi.feed_id === item.feed_id
      );
      if (softDeletedItem) {
        await softDeletedItem.restore({ transaction });
        await softDeletedItem.update(
          {
            quantity: qtyNum,
            user_id: userId,
            updated_by: userId,
          },
          { transaction }
        );
        restoredItems.push(softDeletedItem);
      } else {
        feedItems.push({
          daily_feed_id,
          feed_id: item.feed_id,
          quantity: qtyNum,
          user_id: userId,
          created_by: userId,
          updated_by: userId,
        });
      }
    }

    let createdItems = [];
    if (feedItems.length > 0) {
      createdItems = await DailyFeedItems.bulkCreate(feedItems, {
        transaction,
        validate: true,
        individualHooks: true,
        userId,
      });
    }

    const allItems = [...createdItems, ...restoredItems];

    if (allItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tidak ada item pakan yang valid untuk ditambahkan",
      });
    }

    await transaction.commit();

    const updatedFeed = await DailyFeedSchedule.findByPk(daily_feed_id, {
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["id", "name"],
              include: [
                {
                  model: FeedNutrisi,
                  as: "FeedNutrisiRecords",
                  include: [
                    { model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] },
                  ],
                  required: false,
                },
              ],
            },
            { model: User, as: "Creator", attributes: ["id", "name"], required: false },
            { model: User, as: "Updater", attributes: ["id", "name"], required: false },
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: `${
        restoredItems.length
          ? `${restoredItems.length} item dipulihkan dan `
          : ""
      }${createdItems.length} item pakan berhasil ditambahkan untuk sesi pakan harian`,
      data: updatedFeed.DailyFeedItems.map(formatFeedItemResponse),
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error adding feed items:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validasi gagal: ${error.errors.map((e) => e.message).join(", ")}`,
      });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid: pakan atau sesi pakan tidak ditemukan.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.updateFeedItem = async (req, res) => {
  const { id } = req.params;
  const { feed_id, quantity } = req.body;
  const userId = req.user?.id;
  let transaction;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    const qtyNum = parseFloat(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity harus berupa angka lebih dari 0",
      });
    }

    transaction = await sequelize.transaction();

    const item = await DailyFeedItems.findByPk(id, {
      transaction,
      include: [
        { model: DailyFeedSchedule, as: "DailyFeedSchedule" },
        { model: Feed, as: "Feed", attributes: ["id", "name"] },
      ],
    });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Item pakan tidak ditemukan",
      });
    }

    const userCowAssociation = await UserCowAssociation.findOne({
      where: { user_id: userId, cow_id: item.DailyFeedSchedule.cow_id },
      transaction,
    });
    if (!userCowAssociation) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Anda tidak memiliki izin untuk mengelola pakan sapi dengan ID ${item.DailyFeedSchedule.cow_id}`,
      });
    }

    let targetFeedId = feed_id || item.feed_id;
    const feed = await Feed.findByPk(targetFeedId, { transaction });
    if (!feed) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Pakan dengan ID ${targetFeedId} tidak ditemukan`,
      });
    }

    if (feed_id && feed_id !== item.feed_id) {
      const existingItem = await DailyFeedItems.findOne({
        where: {
          daily_feed_id: item.daily_feed_id,
          feed_id: targetFeedId,
          deletedAt: { [Op.ne]: null },
        },
        transaction,
        paranoid: false,
      });

      if (existingItem) {
        await existingItem.restore({ transaction });
        await existingItem.update(
          {
            quantity: qtyNum,
            user_id: userId,
            updated_by: userId,
          },
          { transaction }
        );
        await item.destroy({ transaction });
        targetFeedId = existingItem.id;
      } else {
        const nonDeletedItem = await DailyFeedItems.findOne({
          where: {
            daily_feed_id: item.daily_feed_id,
            feed_id: targetFeedId,
          },
          transaction,
        });
        if (nonDeletedItem) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Jenis pakan ${feed.name} sudah ada dalam sesi ini`,
            duplicates: [{ id: targetFeedId, name: feed.name }],
          });
        }
        await item.update(
          {
            feed_id: targetFeedId,
            quantity: qtyNum,
            user_id: userId,
            updated_by: userId,
          },
          { transaction }
        );
      }
    } else {
      await item.update(
        {
          quantity: qtyNum,
          user_id: userId,
          updated_by: userId,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const updatedItem = await DailyFeedItems.findByPk(targetFeedId, {
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["id", "name"],
          include: [
            {
              model: FeedNutrisi,
              as: "FeedNutrisiRecords",
              include: [
                { model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] },
              ],
              required: false,
            },
          ],
          required: false,
        },
        { model: User, as: "Creator", attributes: ["id", "name"], required: false },
        { model: User, as: "Updater", attributes: ["id", "name"], required: false },
      ],
    });

    return res.status(200).json({
      success: true,
      message: `Item pakan ${updatedItem.Feed.name} berhasil diperbarui`,
      data: formatFeedItemResponse(updatedItem),
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error updating feed item:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validasi gagal: ${error.errors.map((e) => e.message).join(", ")}`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.deleteFeedItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  let transaction;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    transaction = await sequelize.transaction();

    const item = await DailyFeedItems.findByPk(id, {
      transaction,
      include: [
        { model: DailyFeedSchedule, as: "DailyFeedSchedule" },
        { model: Feed, as: "Feed", attributes: ["id", "name"] },
      ],
    });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Item pakan tidak ditemukan",
      });
    }

    const userCowAssociation = await UserCowAssociation.findOne({
      where: { user_id: userId, cow_id: item.DailyFeedSchedule.cow_id },
      transaction,
    });
    if (!userCowAssociation) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Anda tidak memiliki izin untuk menghapus pakan sapi dengan ID ${item.DailyFeedSchedule.cow_id}`,
      });
    }

    const feedName = item.Feed ? item.Feed.name : "item ini";
    const deletedQuantity = parseFloat(item.quantity);

    await item.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `${feedName} berhasil dihapus sebanyak ${deletedQuantity} kg`,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error deleting feed item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.bulkUpdateFeedItems = async (req, res) => {
  const { items } = req.body;
  const userId = req.user?.id;
  let transaction;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array items non-kosong diperlukan",
      });
    }

    transaction = await sequelize.transaction();

    const results = [];
    const affectedDailyFeeds = new Set();

    for (const item of items) {
      const { id, feed_id, quantity } = item;

      if (!id || !quantity) {
        results.push({
          id,
          success: false,
          message: "ID dan quantity diperlukan",
        });
        continue;
      }

      const qtyNum = parseFloat(quantity);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        results.push({
          id,
          success: false,
          message: "Quantity harus lebih dari 0",
        });
        continue;
      }

      const feedItem = await DailyFeedItems.findByPk(id, {
        transaction,
        include: [
          { model: DailyFeedSchedule, as: "DailyFeedSchedule" },
          { model: Feed, as: "Feed", attributes: ["id", "name"] },
        ],
      });

      if (!feedItem) {
        results.push({
          id,
          success: false,
          message: "Item pakan tidak ditemukan",
        });
        continue;
      }

      const userCowAssociation = await UserCowAssociation.findOne({
        where: { user_id: userId, cow_id: feedItem.DailyFeedSchedule.cow_id },
        transaction,
      });
      if (!userCowAssociation) {
        results.push({
          id,
          success: false,
          message: `Anda tidak memiliki izin untuk mengelola pakan sapi dengan ID ${feedItem.DailyFeedSchedule.cow_id}`,
        });
        continue;
      }

      let targetFeedId = feed_id || feedItem.feed_id;
      const feed = await Feed.findByPk(targetFeedId, { transaction });
      if (!feed) {
        results.push({
          id,
          success: false,
          message: `Pakan dengan ID ${targetFeedId} tidak ditemukan`,
        });
        continue;
      }

      try {
        if (feed_id && feed_id !== feedItem.feed_id) {
          const existingItem = await DailyFeedItems.findOne({
            where: {
              daily_feed_id: feedItem.daily_feed_id,
              feed_id: targetFeedId,
              deletedAt: { [Op.ne]: null },
            },
            transaction,
            paranoid: false,
          });

          if (existingItem) {
            await existingItem.restore({ transaction });
            await existingItem.update(
              {
                quantity: qtyNum,
                user_id: userId,
                updated_by: userId,
              },
              { transaction }
            );
            await feedItem.destroy({ transaction });
            affectedDailyFeeds.add(feedItem.daily_feed_id);
            results.push({
              id,
              success: true,
              message: `${feed.name} berhasil dipulihkan`,
            });
          } else {
            const nonDeletedItem = await DailyFeedItems.findOne({
              where: {
                daily_feed_id: feedItem.daily_feed_id,
                feed_id: targetFeedId,
              },
              transaction,
            });
            if (nonDeletedItem) {
              results.push({
                id,
                success: false,
                message: `Jenis pakan ${feed.name} sudah ada dalam sesi ini`,
              });
              continue;
            }
            await feedItem.update(
              {
                feed_id: targetFeedId,
                quantity: qtyNum,
                user_id: userId,
                updated_by: userId,
              },
              { transaction }
            );
            affectedDailyFeeds.add(feedItem.daily_feed_id);
            results.push({
              id,
              success: true,
              message: `${feed.name} berhasil diperbarui`,
            });
          }
        } else {
          await feedItem.update(
            {
              quantity: qtyNum,
              user_id: userId,
              updated_by: userId,
            },
            { transaction }
          );
          affectedDailyFeeds.add(feedItem.daily_feed_id);
          results.push({
            id,
            success: true,
            message: `${feedItem.Feed.name} berhasil diperbarui`,
          });
        }
      } catch (error) {
        results.push({ id, success: false, message: error.message });
      }
    }

    if (results.every((result) => !result.success)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tidak ada item yang berhasil diperbarui",
        results,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `${results.filter((r) => r.success).length} dari ${results.length} item berhasil diperbarui`,
      results,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error bulk updating feed items:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getAllFeedItems = async (req, res) => {
  try {
    const { daily_feed_id, feed_id } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    const filter = {};
    if (daily_feed_id) filter.daily_feed_id = daily_feed_id;
    if (feed_id) filter.feed_id = feed_id;

    const include = [
      { model: DailyFeedSchedule, as: "DailyFeedSchedule", attributes: ["id", "cow_id"], required: true },
      {
        model: Feed,
        as: "Feed",
        attributes: ["id", "name"],
        include: [
          {
            model: FeedNutrisi,
            as: "FeedNutrisiRecords",
            include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
            required: false,
          },
        ],
        required: false,
      },
      { model: User, as: "Creator", attributes: ["id", "name"], required: false },
      { model: User, as: "Updater", attributes: ["id", "name"], required: false },
    ];

    if (userRole === "farmer") {
      const userCows = await UserCowAssociation.findAll({
        where: { user_id: userId },
        attributes: ["cow_id"],
      });
      const allowedCowIds = userCows.map((uc) => uc.cow_id);
      filter["$DailyFeedSchedule.cow_id$"] = allowedCowIds.length > 0 ? { [Op.in]: allowedCowIds } : { [Op.eq]: null };
    }

    const items = await DailyFeedItems.findAll({
      where: filter,
      include,
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items.map(formatFeedItemResponse),
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getFeedItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    const item = await DailyFeedItems.findByPk(id, {
      include: [
        { model: DailyFeedSchedule, as: "DailyFeedSchedule", attributes: ["id", "cow_id"], required: true },
        {
          model: Feed,
          as: "Feed",
          attributes: ["id", "name"],
          include: [
            {
              model: FeedNutrisi,
              as: "FeedNutrisiRecords",
              include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
              required: false,
            },
          ],
          required: false,
        },
        { model: User, as: "Creator", attributes: ["id", "name"], required: false },
        { model: User, as: "Updater", attributes: ["id", "name"], required: false },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item pakan tidak ditemukan",
      });
    }

    if (userRole === "farmer") {
      const userCowAssociation = await UserCowAssociation.findOne({
        where: { user_id: userId, cow_id: item.DailyFeedSchedule.cow_id },
      });
      if (!userCowAssociation) {
        return res.status(403).json({
          success: false,
          message: `Anda tidak memiliki izin untuk melihat item pakan sapi dengan ID ${item.DailyFeedSchedule.cow_id}`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: formatFeedItemResponse(item),
    });
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getFeedItemsByDailyFeedId = async (req, res) => {
  try {
    const { daily_feed_id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    if (isNaN(daily_feed_id)) {
      return res.status(400).json({
        success: false,
        message: "daily_feed_id tidak valid",
      });
    }

    const dailyFeed = await DailyFeedSchedule.findByPk(daily_feed_id, {
      attributes: ["id", "cow_id"],
    });
    if (!dailyFeed) {
      return res.status(404).json({
        success: false,
        message: "Sesi pakan harian tidak ditemukan",
      });
    }

    if (userRole === "farmer") {
      const userCowAssociation = await UserCowAssociation.findOne({
        where: { user_id: userId, cow_id: dailyFeed.cow_id },
      });
      if (!userCowAssociation) {
        return res.status(403).json({
          success: false,
          message: `Anda tidak memiliki izin untuk melihat item pakan sapi dengan ID ${dailyFeed.cow_id}`,
        });
      }
    }

    const items = await DailyFeedItems.findAll({
      where: { daily_feed_id },
      include: [
        { model: DailyFeedSchedule, as: "DailyFeedSchedule", attributes: ["id", "cow_id"], required: true },
        {
          model: Feed,
          as: "Feed",
          attributes: ["id", "name"],
          include: [
            {
              model: FeedNutrisi,
              as: "FeedNutrisiRecords",
              include: [{ model: Nutrisi, as: "Nutrisi", attributes: ["id", "name", "unit"] }],
              required: false,
            },
          ],
          required: false,
        },
        { model: User, as: "Creator", attributes: ["id", "name"], required: false },
        { model: User, as: "Updater", attributes: ["id", "name"], required: false },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items.map(formatFeedItemResponse),
    });
  } catch (error) {
    console.error("Error fetching feed items by daily feed ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getFeedUsageByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi gagal. Silakan login kembali.",
      });
    }

    if (start_date && !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal mulai harus YYYY-MM-DD",
      });
    }
    if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal akhir harus YYYY-MM-DD",
      });
    }
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai harus sebelum tanggal akhir",
      });
    }

    const whereClause = {};
    if (start_date || end_date) {
      whereClause["$DailyFeedSchedule.date$"] = {};
      if (start_date) whereClause["$DailyFeedSchedule.date$"][Op.gte] = start_date;
      if (end_date) whereClause["$DailyFeedSchedule.date$"][Op.lte] = end_date;
    }

    const feedUsage = await DailyFeedItems.findAll({
      attributes: [
        [sequelize.col("DailyFeedSchedule.date"), "date"],
        "feed_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity"],
      ],
      include: [
        { model: Feed, as: "Feed", attributes: ["id", "name"] },
        {
          model: DailyFeedSchedule,
          as: "DailyFeedSchedule",
          attributes: [],
          where: whereClause["$DailyFeedSchedule.date$"] ? { date: whereClause["$DailyFeedSchedule.date$"] } : {},
        },
      ],
      group: ["DailyFeedSchedule.date", "feed_id", "Feed.id", "Feed.name"],
      order: [[sequelize.col("DailyFeedSchedule.date"), "ASC"]],
    });

    const formattedData = [];
    const dateMap = {};

    feedUsage.forEach((item) => {
      const date = item.dataValues.date;
      const feedData = {
        feed_id: item.feed_id,
        feed_name: item.Feed.name,
        quantity_kg: parseFloat(item.dataValues.total_quantity).toFixed(2),
      };

      if (!dateMap[date]) {
        dateMap[date] = { date, feeds: [] };
        formattedData.push(dateMap[date]);
      }

      dateMap[date].feeds.push(feedData);
    });

    formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data penggunaan pakan per tanggal",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching feed usage by date:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};