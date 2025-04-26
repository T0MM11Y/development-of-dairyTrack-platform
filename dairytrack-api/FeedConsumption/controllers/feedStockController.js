const FeedStock = require("../models/feedStockModel");
const Feed = require("../models/feedModel");

// Get all feed stocks
exports.getAllFeedStocks = async (req, res) => {
  try {
    const feeds = await Feed.findAll({
      attributes: ["id", "name"],
      include: {
        model: FeedStock,
        as: "FeedStock", // sesuai alias di hasOne!
        required: false, // supaya meskipun stoknya NULL tetap keluar
      },
    });

    res.status(200).json({ success: true, feeds });
  } catch (err) {
    console.error("Error fetching feed stocks:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// Get feed stock by ID
exports.getFeedStockById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, field: "id", message: "Invalid ID format" });
  }

  try {
    const stock = await FeedStock.findOne({
      where: { id },
      include: {
        model: Feed,
        as: "Feed", // Corrected alias to match association
        attributes: ["id", "name"],
      },
    });

    if (!stock) {
      return res.status(404).json({ success: false, field: "id", message: "Feed stock not found" });
    }

    res.status(200).json({ success: true, stock });
  } catch (err) {
    console.error("Error fetching feed stock:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// Tambah (update) stock: Jika record sudah ada untuk feedId, tambahkan stock; jika tidak, buat record baru.
exports.addFeedStock = async (req, res) => {
  const { feedId, additionalStock } = req.body;

  if (!feedId) return res.status(400).json({ success: false, field: "feedId", message: "Feed ID is required" });
  if (additionalStock === undefined) return res.status(400).json({ success: false, field: "additionalStock", message: "Additional stock is required" });

  try {
    // Pastikan feed ada
    const feed = await Feed.findByPk(feedId);
    if (!feed) {
      return res.status(404).json({ success: false, field: "feedId", message: "Feed not found" });
    }

    // Cek apakah sudah ada record stock untuk feed ini
    let stockRecord = await FeedStock.findOne({ where: { feedId } });
    if (stockRecord) {
      // Tambahkan additionalStock ke stock yang sudah ada
      const newStock = parseFloat(stockRecord.stock) + parseFloat(additionalStock);
      await stockRecord.update({ stock: newStock });
      res.status(200).json({ success: true, stock: stockRecord });
    } else {
      // Jika tidak ada, buat record baru
      stockRecord = await FeedStock.create({ feedId, stock: parseFloat(additionalStock) });
      res.status(201).json({ success: true, stock: stockRecord });
    }
  } catch (err) {
    console.error("Error adding feed stock:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// Update feed stock (ubah nilai stok secara manual)
exports.updateFeedStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined) {
    return res.status(400).json({ success: false, field: "stock", message: "Stock value is required" });
  }

  try {
    const stockRecord = await FeedStock.findByPk(id);
    if (!stockRecord) {
      return res.status(404).json({ success: false, field: "id", message: "Feed stock not found" });
    }

    await stockRecord.update({ stock: parseFloat(stock) });
    res.status(200).json({ success: true, stock: stockRecord });
  } catch (err) {
    console.error("Error updating feed stock:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};
