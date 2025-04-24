const DailyFeedSchedule = require("../models/dailyFeedSchedule"); // Perbaiki nama impor
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");
const FeedStock = require("../models/feedStockModel");
const FeedNutrisi = require("../models/feedNutritionModel");
const Nutrisi = require("../models/nutritionModel");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// **ADD FEED ITEM (Tambah Item Pakan)**
exports.addFeedItem = async (req, res) => {
  console.log("Request received:", req.body);
  const { daily_feed_id, feed_items } = req.body;
  let t;

  try {
    // Validasi input
    if (!daily_feed_id || !Array.isArray(feed_items) || feed_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Semua field diperlukan dan feed_items harus berupa array",
        received: { daily_feed_id, feed_items_length: feed_items ? feed_items.length : 0 },
      });
    }

    // Periksa apakah daily feed ada sebelum memulai transaksi
    const feed = await DailyFeedSchedule.findByPk(daily_feed_id, {
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
        },
      ],
    });

    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Sesi pakan harian tidak ditemukan",
      });
    }

    // Periksa batas maksimum 3 item
    if (feed.DailyFeedItems && feed.DailyFeedItems.length >= 3) {
      return res.status(400).json({
        success: false,
        message: "Sesi pakan ini sudah memiliki 3 jenis pakan (maksimum)",
      });
    }

    // Periksa apakah penambahan item akan melebihi batas 3
    if (feed.DailyFeedItems && feed.DailyFeedItems.length + feed_items.length > 3) {
      return res.status(400).json({
        success: false,
        message: `Sesi pakan ini sudah memiliki ${feed.DailyFeedItems.length} jenis pakan. Anda hanya bisa menambahkan ${3 - feed.DailyFeedItems.length} lagi.`,
      });
    }

    // Mulai transaksi
    t = await sequelize.transaction();

    const addedItems = [];
    const errors = [];

    // Periksa duplikasi feed_id dalam request
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
      });

      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Terdapat jenis pakan yang sama dalam permintaan: ${duplicateFeedNames.map((feed) => feed.name).join(", ")}. Pilih jenis pakan yang berbeda.`,
        duplicates: duplicateFeedNames.map((feed) => ({ id: feed.id, name: feed.name })),
      });
    }

    // Periksa apakah feed_id sudah ada di sesi ini
    if (feed.DailyFeedItems && feed.DailyFeedItems.length > 0) {
      const existingFeedIds = feed.DailyFeedItems.map((item) => item.feed_id);
      const duplicateFeedIds = feedIdsInRequest.filter((id) => existingFeedIds.includes(id));

      if (duplicateFeedIds.length > 0) {
        const duplicateFeedNames = await Feed.findAll({
          where: { id: duplicateFeedIds },
          attributes: ["id", "name"],
        });

        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Beberapa jenis pakan sudah ada dalam sesi ini",
          duplicates: duplicateFeedNames.map((feed) => feed.name).join(", "),
        });
      }
    }

    for (const item of feed_items) {
      try {
        const { feed_id, quantity } = item;

        if (!feed_id || !quantity) {
          errors.push({ item, error: "ID pakan atau jumlah tidak boleh kosong" });
          continue;
        }

        // Validasi feed
        const feedData = await Feed.findByPk(feed_id, {
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

        if (!feedData) {
          errors.push({ feed_id, error: "Jenis pakan tidak ditemukan" });
          continue;
        }

        // Validasi jumlah
        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) {
          errors.push({ feed_id, feed_name: feedData.name, error: "Jumlah harus lebih dari 0" });
          continue;
        }

        // Buat item baru (validasi stok ditangani oleh model)
        const newItem = await DailyFeedItems.create(
          {
            daily_feed_id,
            feed_id,
            quantity: qtyNum,
          },
          { transaction: t }
        );

        // Tambahkan info lengkap untuk respons, termasuk nutrisi
        const nutrients = feedData.FeedNutrisiRecords.map((nutrisi) => ({
          nutrient_id: nutrisi.nutrisi_id,
          name: nutrisi.Nutrisi.name,
          unit: nutrisi.Nutrisi.unit,
          amount: parseFloat(nutrisi.amount),
        }));

        const createdItem = {
          ...newItem.get({ plain: true }),
          feed: {
            name: feedData.name,
            nutrients, // Sertakan semua nutrisi dari FeedNutrisi
          },
        };

        addedItems.push(createdItem);
      } catch (itemError) {
        errors.push({ item, error: itemError.message });
      }
    }

    if (addedItems.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Tidak ada item pakan yang dapat ditambahkan",
        errors,
      });
    }

    await t.commit();

    // Ambil data sesi yang diperbarui
    const updatedFeed = await DailyFeedSchedule.findByPk(daily_feed_id, {
      include: [
        {
          model: DailyFeedItems,
          as: "DailyFeedItems",
          include: [
            {
              model: Feed,
              as: "Feed",
              attributes: ["name"],
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
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: `${addedItems.length} jenis pakan berhasil ditambahkan`,
      errors: errors.length > 0 ? errors : undefined,
      data: updatedFeed,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error adding feed items:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **UPDATE FEED ITEM (Perbarui Item Pakan)**
exports.updateFeedItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  let t;

  try {
    t = await sequelize.transaction();

    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Jumlah harus berupa angka lebih dari 0",
      });
    }

    const item = await DailyFeedItems.findByPk(id, {
      transaction: t,
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
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
        },
      ],
    });

    if (!item) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Item pakan tidak ditemukan",
      });
    }

    // Perbarui item (validasi stok ditangani oleh model)
    await item.update({ quantity: parseFloat(quantity) }, { transaction: t });

    await t.commit();

    // Ambil item yang diperbarui
    const updatedItem = await DailyFeedItems.findByPk(id, {
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
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
        },
      ],
    });

    // Format nutrisi untuk respons
    const nutrients = updatedItem.Feed.FeedNutrisiRecords.map((nutrisi) => ({
      nutrient_id: nutrisi.nutrisi_id,
      name: nutrisi.Nutrisi.name,
      unit: nutrisi.Nutrisi.unit,
      amount: parseFloat(nutrisi.amount),
    }));

    const formattedItem = {
      ...updatedItem.get({ plain: true }),
      feed: {
        name: updatedItem.Feed.name,
        nutrients,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Item pakan berhasil diperbarui",
      data: formattedItem,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error updating feed item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **DELETE FEED ITEM (Hapus Item Pakan)**
exports.deleteFeedItem = async (req, res) => {
  const { id } = req.params;
  let t;

  try {
    t = await sequelize.transaction();

    const item = await DailyFeedItems.findByPk(id, {
      transaction: t,
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
        },
      ],
    });

    if (!item) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Item pakan tidak ditemukan",
      });
    }

    const feedName = item.Feed ? item.Feed.name : "item ini";
    const deletedQuantity = parseFloat(item.quantity);

    // Hapus item (hooks akan menangani perhitungan nutrisi)
    await item.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `${feedName} berhasil dihapus dan stok dikembalikan sebanyak ${deletedQuantity}kg`,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error deleting feed item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **BULK UPDATE FEED ITEMS (Perbarui Beberapa Item Pakan)**
exports.bulkUpdateFeedItems = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Array items diperlukan",
    });
  }

  let t;

  try {
    t = await sequelize.transaction();

    const results = [];
    const affectedDailyFeeds = new Set();

    for (const item of items) {
      const { id, quantity } = item;

      if (!id || !quantity) {
        results.push({ id, success: false, message: "ID atau jumlah tidak boleh kosong" });
        continue;
      }

      const feedItem = await DailyFeedItems.findByPk(id, {
        transaction: t,
        include: [
          {
            model: Feed,
            as: "Feed",
            attributes: ["name"],
          },
        ],
      });

      if (feedItem) {
        const newQuantity = parseFloat(quantity);

        if (isNaN(newQuantity) || newQuantity <= 0) {
          results.push({ id, success: false, message: "Jumlah harus lebih dari 0" });
          continue;
        }

        const feedName = feedItem.Feed ? feedItem.Feed.name : `Item ID ${id}`;

        // Perbarui item (validasi stok ditangani oleh model)
        await feedItem.update({ quantity: newQuantity }, { transaction: t });

        affectedDailyFeeds.add(feedItem.daily_feed_id);
        results.push({ id, success: true, message: `${feedName} berhasil diperbarui` });
      } else {
        results.push({ id, success: false, message: "Item tidak ditemukan" });
      }
    }

    // Jika semua pembaruan gagal, rollback transaksi
    if (results.every((result) => !result.success)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Tidak ada item yang berhasil diperbarui",
        results,
      });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `${results.filter((r) => r.success).length} dari ${results.length} item berhasil diperbarui`,
      results,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error bulk updating feed items:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **GET ALL FEED ITEMS**
exports.getAllFeedItems = async (req, res) => {
  try {
    const { daily_feed_id, feed_id } = req.query;
    const filter = {};

    if (daily_feed_id) filter.daily_feed_id = daily_feed_id;
    if (feed_id) filter.feed_id = feed_id;

    const items = await DailyFeedItems.findAll({
      where: filter,
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
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
        },
      ],
      order: [["id", "ASC"]],
    });

    // Format respons
    const formattedItems = items.map((item) => {
      const nutrients = item.Feed.FeedNutrisiRecords.map((nutrisi) => ({
        nutrient_id: nutrisi.nutrisi_id,
        name: nutrisi.Nutrisi.name,
        unit: nutrisi.Nutrisi.unit,
        amount: parseFloat(nutrisi.amount),
      }));

      return {
        ...item.get({ plain: true }),
        feed: {
          name: item.Feed.name,
          nutrients,
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedItems.length,
      data: formattedItems,
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **GET FEED ITEM BY ID**
exports.getFeedItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await DailyFeedItems.findByPk(id, {
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
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
        },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item pakan tidak ditemukan",
      });
    }

    // Format nutrisi untuk respons
    const nutrients = item.Feed.FeedNutrisiRecords.map((nutrisi) => ({
      nutrient_id: nutrisi.nutrisi_id,
      name: nutrisi.Nutrisi.name,
      unit: nutrisi.Nutrisi.unit,
      amount: parseFloat(nutrisi.amount),
    }));

    const formattedItem = {
      ...item.get({ plain: true }),
      feed: {
        name: item.Feed.name,
        nutrients,
      },
    };

    return res.status(200).json({
      success: true,
      data: formattedItem,
    });
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **GET FEED ITEMS BY DAILY FEED ID**
exports.getFeedItemsByDailyFeedId = async (req, res) => {
  const { daily_feed_id } = req.params;

  try {
    // Pastikan daily feed ada
    const feed = await DailyFeedSchedule.findByPk(daily_feed_id);
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Sesi pakan harian tidak ditemukan",
      });
    }

    // Ambil feed items
    const feedItems = await DailyFeedItems.findAll({
      where: { daily_feed_id },
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
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
        },
      ],
    });

    // Format respons
    const formattedItems = feedItems.map((item) => {
      const nutrients = item.Feed.FeedNutrisiRecords.map((nutrisi) => ({
        nutrient_id: nutrisi.nutrisi_id,
        name: nutrisi.Nutrisi.name,
        unit: nutrisi.Nutrisi.unit,
        amount: parseFloat(nutrisi.amount),
      }));

      return {
        ...item.get({ plain: true }),
        feed: {
          name: item.Feed.name,
          nutrients,
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedItems.length,
      data: formattedItems,
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// **GET FEED USAGE BY DATE**
exports.getFeedUsageByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Validasi tanggal
    if (start_date && isNaN(Date.parse(start_date))) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal mulai tidak valid. Gunakan YYYY-MM-DD.",
      });
    }
    if (end_date && isNaN(Date.parse(end_date))) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal akhir tidak valid. Gunakan YYYY-MM-DD.",
      });
    }
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai harus sebelum tanggal akhir.",
      });
    }

    // Bangun filter tanggal
    const whereClause = {};
    if (start_date || end_date) {
      whereClause["$DailyFeedSchedule.date$"] = {};
      if (start_date) {
        whereClause["$DailyFeedSchedule.date$"][Op.gte] = start_date;
      }
      if (end_date) {
        whereClause["$DailyFeedSchedule.date$"][Op.lte] = end_date;
      }
    }

    // Query penggunaan pakan per tanggal
    const feedUsage = await DailyFeedItems.findAll({
      attributes: [
        [sequelize.col("DailyFeedSchedule.date"), "date"],
        "feed_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity"],
      ],
      include: [
        {
          model: Feed,
          as: "Feed",
          attributes: ["name"],
        },
        {
          model: DailyFeedSchedule,
          as: "DailyFeedSchedule",
          attributes: [],
          where: whereClause["$DailyFeedSchedule.date$"]
            ? {
                date: whereClause["$DailyFeedSchedule.date$"],
              }
            : undefined,
        },
      ],
      group: ["DailyFeedSchedule.date", "feed_id", "Feed.id", "Feed.name"],
      order: [[sequelize.col("DailyFeedSchedule.date"), "ASC"]],
    });

    // Format respons
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
        dateMap[date] = {
          date,
          feeds: [],
        };
        formattedData.push(dateMap[date]);
      }

      dateMap[date].feeds.push(feedData);
    });

    // Urutkan data berdasarkan tanggal
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
      error: error.message,
    });
  }
};