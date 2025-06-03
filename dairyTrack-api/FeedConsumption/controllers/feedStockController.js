const FeedStock = require("../models/feedStockModel");
const Feed = require("../models/feedModel");
const User = require("../models/userModel");
const FeedStockHistory = require("../models/feedStockHistoryModel");

// Helper function to format FeedStock response
const formatFeedStockResponse = (stock) => ({
  id: stock.id,
  feed_id: stock.feedId,
  feed_name: stock.Feed ? stock.Feed.name : null,
  stock: parseFloat(stock.stock),
  user_id: stock.user_id,
  user_name: stock.User ? stock.User.name : null,
  created_by: stock.Creator ? { id: stock.Creator.id, name: stock.Creator.name } : null,
  updated_by: stock.Updater ? { id: stock.Updater.id, name: stock.Updater.name } : null,
  created_at: stock.createdAt,
  updated_at: stock.updatedAt,
});

// Helper function to format FeedStockHistory response
const formatFeedStockHistoryResponse = (history) => {
  const response = {
    id: history.id,
    feed_stock_id: history.feedStockId,
    feed_id: history.feedId,
    feed_name: history.Feed ? history.Feed.name : `Feed ID ${history.feedId}`,
    user_id: history.userId,
    user_name: history.User ? history.User.name : `User ID ${history.userId}`,
    action: history.action,
    stock: parseFloat(history.stock),
    previous_stock: history.previousStock ? parseFloat(history.previousStock) : null,
    created_at: history.createdAt,
  };
  
  if (history.action === "CREATE") {
    response.change_description = `Stok untuk ${response.feed_name} dibuat dengan jumlah ${response.stock} oleh ${response.user_name}`;
  } else if (history.action === "UPDATE") {
    response.change_description = `Stok untuk ${response.feed_name} berubah dari ${response.previous_stock} menjadi ${response.stock} oleh ${response.user_name}`;
  }
  
  return response;
};

// Get all feed stocks
exports.getAllFeedStocks = async (req, res) => {
  try {
    const feeds = await Feed.findAll({
      attributes: ["id", "name"],
      include: {
        model: FeedStock,
        as: "FeedStock",
        required: false,
        include: [
          { model: User, as: "User", attributes: ["id", "name"], required: false },
          { model: User, as: "Creator", attributes: ["id", "name"], required: false },
          { model: User, as: "Updater", attributes: ["id", "name"], required: false },
        ],
      },
    });

    const formattedFeeds = feeds.map((feed) => ({
      id: feed.id,
      name: feed.name,
      stock: feed.FeedStock ? formatFeedStockResponse(feed.FeedStock) : null,
    }));

    res.status(200).json({ success: true, data: formattedFeeds });
  } catch (err) {
    console.error("Error fetching feed stocks:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Get feed stock by ID
exports.getFeedStockById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    console.error("Invalid FeedStock ID:", id);
    return res.status(400).json({ success: false, field: "id", message: "ID tidak valid atau tidak disediakan" });
  }

  try {
    const stock = await FeedStock.findOne({
      where: { id },
      include: [
        { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
        { model: User, as: "User", attributes: ["id", "name"], required: false },
        { model: User, as: "Creator", attributes: ["id", "name"], required: false },
        { model: User, as: "Updater", attributes: ["id", "name"], required: false },
      ],
    });

    if (!stock) {
      return res.status(404).json({ success: false, field: "id", message: "Stok pakan tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: formatFeedStockResponse(stock) });
  } catch (err) {
    console.error("Error fetching feed stock:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Get all feed stock history
exports.getAllFeedStockHistory = async (req, res) => {
  try {
    const history = await FeedStockHistory.findAll({
      include: [
        { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
        { model: User, as: "User", attributes: ["id", "name"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("Fetched all feed stock history records:", history.length);

    if (!history || history.length === 0) {
      return res.status(404).json({ success: false, message: "Riwayat stok pakan tidak ditemukan" });
    }

    const formattedHistory = history.map(formatFeedStockHistoryResponse);
    res.status(200).json({ success: true, data: formattedHistory });
  } catch (err) {
    console.error("Error fetching all feed stock history:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Get feed stock history by feedStockId
exports.getFeedStockHistory = async (req, res) => {
  const { feedStockId } = req.params;
  console.log("Received feedStockId:", feedStockId, "Type:", typeof feedStockId);

  if (!feedStockId || isNaN(parseInt(feedStockId))) {
    console.error("Invalid feedStockId:", feedStockId);
    return res.status(400).json({ success: false, field: "feedStockId", message: "Feed Stock ID tidak valid atau tidak disediakan" });
  }

  try {
    const feedStock = await FeedStock.findByPk(feedStockId);
    if (!feedStock) {
      console.error("FeedStock not found for ID:", feedStockId);
      return res.status(404).json({ success: false, field: "feedStockId", message: "Stok pakan tidak ditemukan" });
    }

    const history = await FeedStockHistory.findAll({
      where: { feedStockId },
      include: [
        { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
        { model: User, as: "User", attributes: ["id", "name"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("Fetched history for feedStockId:", feedStockId, "Records:", history.length);

    if (!history || history.length === 0) {
      return res.status(404).json({ success: false, message: "Riwayat stok pakan tidak ditemukan" });
    }

    const formattedHistory = history.map(formatFeedStockHistoryResponse);
    res.status(200).json({ success: true, data: formattedHistory });
  } catch (err) {
    console.error("Error fetching feed stock history:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Get feed stock history by ID
exports.getFeedStockHistoryById = async (req, res) => {
  const { id } = req.params;
  console.log("Received history ID:", id, "Type:", typeof id);

  if (!id || isNaN(parseInt(id))) {
    console.error("Invalid history ID:", id);
    return res.status(400).json({ success: false, field: "id", message: "ID tidak valid atau tidak disediakan" });
  }

  try {
    const history = await FeedStockHistory.findOne({
      where: { id },
      include: [
        { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
        { model: User, as: "User", attributes: ["id", "name"], required: false },
      ],
    });

    if (!history) {
      return res.status(404).json({ success: false, field: "id", message: "Riwayat stok pakan tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: formatFeedStockHistoryResponse(history) });
  } catch (err) {
    console.error("Error fetching feed stock history by ID:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Delete feed stock history by ID
exports.deleteFeedStockHistory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
  }

  if (!id || isNaN(parseInt(id))) {
    console.error("Invalid history ID for deletion:", id);
    return res.status(400).json({ success: false, field: "id", message: "ID tidak valid atau tidak disediakan" });
  }

  try {
    const history = await FeedStockHistory.findByPk(id);
    if (!history) {
      return res.status(404).json({ success: false, field: "id", message: "Riwayat stok pakan tidak ditemukan" });
    }

    await history.destroy();
    res.status(200).json({ success: true, message: "Riwayat stok pakan berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting feed stock history:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Add or update feed stock
exports.addFeedStock = async (req, res) => {
  const { feedId, additionalStock } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
  }
  if (!feedId) {
    return res.status(400).json({ success: false, field: "feedId", message: "Feed ID wajib diisi" });
  }
  if (additionalStock === undefined || isNaN(additionalStock)) {
    return res.status(400).json({ success: false, field: "additionalStock", message: "Jumlah stok tambahan tidak valid" });
  }

  try {
    const feed = await Feed.findByPk(feedId);
    if (!feed) {
      return res.status(404).json({ success: false, field: "feedId", message: "Pakan tidak ditemukan" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: `User dengan ID ${userId} tidak ditemukan` });
    }

    let stockRecord = await FeedStock.findOne({ where: { feedId } });
    if (stockRecord) {
      const newStock = parseFloat(stockRecord.stock) + parseFloat(additionalStock);
      if (newStock < 0) {
        return res.status(400).json({ success: false, message: "Stok tidak boleh negatif" });
      }
      await stockRecord.update({ stock: newStock, updated_by: userId }, { userId });
      stockRecord = await FeedStock.findByPk(stockRecord.id, {
        include: [
          { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
          { model: User, as: "User", attributes: ["id", "name"], required: false },
          { model: User, as: "Creator", attributes: ["id", "name"], required: false },
          { model: User, as: "Updater", attributes: ["id", "name"], required: false },
        ],
      });
      res.status(200).json({
        success: true,
        message: `Stok pakan "${feed.name}" berhasil diperbarui`,
        data: formatFeedStockResponse(stockRecord),
      });
    } else {
      if (additionalStock < 0) {
        return res.status(400).json({ success: false, message: "Stok awal tidak boleh negatif" });
      }
      stockRecord = await FeedStock.create(
        {
          feedId,
          stock: parseFloat(additionalStock),
          user_id: userId,
          created_by: userId,
          updated_by: userId,
        },
        { userId }
      );
      stockRecord = await FeedStock.findByPk(stockRecord.id, {
        include: [
          { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
          { model: User, as: "User", attributes: ["id", "name"], required: false },
          { model: User, as: "Creator", attributes: ["id", "name"], required: false },
          { model: User, as: "Updater", attributes: ["id", "name"], required: false },
        ],
      });
      res.status(201).json({
        success: true,
        message: `Stok pakan "${feed.name}" berhasil ditambahkan`,
        data: formatFeedStockResponse(stockRecord),
      });
    }
  } catch (err) {
    console.error("Error adding feed stock:", err);
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validasi gagal: ${err.errors.map(e => e.message).join(", ")}`,
      });
    }
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid: pakan atau user tidak ditemukan",
      });
    }
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Update feed stock manually
exports.updateFeedStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Autentikasi gagal. Silakan login kembali." });
  }
  if (stock === undefined || isNaN(stock)) {
    return res.status(400).json({ success: false, field: "stock", message: "Jumlah stok tidak valid" });
  }
  if (parseFloat(stock) < 0) {
    return res.status(400).json({ success: false, field: "stock", message: "Stok tidak boleh negatif" });
  }

  try {
    const stockRecord = await FeedStock.findByPk(id);
    if (!stockRecord) {
      return res.status(404).json({ success: false, field: "id", message: "Stok pakan tidak ditemukan" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: `User dengan ID ${userId} tidak ditemukan` });
    }

    await stockRecord.update({ stock: parseFloat(stock), updated_by: userId }, { userId });
    const updatedStock = await FeedStock.findByPk(id, {
      include: [
        { model: Feed, as: "Feed", attributes: ["id", "name"], required: false },
        { model: User, as: "User", attributes: ["id", "name"], required: false },
        { model: User, as: "Creator", attributes: ["id", "name"], required: false },
        { model: User, as: "Updater", attributes: ["id", "name"], required: false },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Stok pakan "${updatedStock.Feed.name}" berhasil diperbarui`,
      data: formatFeedStockResponse(updatedStock),
    });
  } catch (err) {
    console.error("Error updating feed stock:", err);
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validasi gagal: ${err.errors.map(e => e.message).join(", ")}`,
      });
    }
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};