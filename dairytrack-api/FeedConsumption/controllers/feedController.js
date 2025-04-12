const Feed = require("../models/feedModel.js");
const FeedType = require("../models/feedTypeModel.js");

// Helper function for validation errors
const getValidationErrors = (error) => {
  if (error.errors) {
    return error.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }
  return [{ field: "unknown", message: error.message }];
};

// Add new feed
exports.addFeed = async (req, res) => {
  console.log("Request body:", req.body);

  const { typeId, name, protein, energy, fiber, min_stock, price } = req.body;

  try {
    if (typeId === undefined || typeId === "")
      return res.status(400).json({ success: false, field: "typeId", message: "Feed type is required" });
    if (name === undefined || name === "")
      return res.status(400).json({ success: false, field: "name", message: "Feed name is required" });
    if (protein === undefined || protein === "")
      return res.status(400).json({ success: false, field: "protein", message: "Protein value is required" });
    if (energy === undefined || energy === "")
      return res.status(400).json({ success: false, field: "energy", message: "Energy value is required" });
    if (fiber === undefined || fiber === "")
      return res.status(400).json({ success: false, field: "fiber", message: "Fiber value is required" });
    if (min_stock === undefined || min_stock === "")
      return res.status(400).json({ success: false, field: "min_stock", message: "Minimum stock is required" });
    if (price === undefined || price === "")
      return res.status(400).json({ success: false, field: "price", message: "Price is required" });

    const parsedProtein = parseFloat(protein);
    const parsedEnergy = parseFloat(energy);
    const parsedFiber = parseFloat(fiber);
    const parsedMinStock = parseInt(min_stock, 10);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedProtein))
      return res.status(400).json({ success: false, field: "protein", message: "Protein must be a valid number" });
    if (isNaN(parsedEnergy))
      return res.status(400).json({ success: false, field: "energy", message: "Energy must be a valid number" });
    if (isNaN(parsedFiber))
      return res.status(400).json({ success: false, field: "fiber", message: "Fiber must be a valid number" });
    if (isNaN(parsedMinStock))
      return res.status(400).json({ success: false, field: "min_stock", message: "Minimum stock must be a valid number" });
    if (isNaN(parsedPrice))
      return res.status(400).json({ success: false, field: "price", message: "Price must be a valid number" });

    const feedType = await FeedType.findByPk(typeId);
    if (!feedType) {
      return res.status(404).json({ success: false, field: "typeId", message: "Feed type not found" });
    }

    // Cek jika nama pakan sudah ada
    const existingFeed = await Feed.findOne({ where: { name } });
    if (existingFeed) {
      return res.status(409).json({
        success: false,
        field: "name",
        message: `Pakan dengan nama "${name}" sudah ada. Silakan gunakan nama lain.`,
      });
    }

    const feed = await Feed.create({
      typeId,
      name,
      protein: parsedProtein,
      energy: parsedEnergy,
      fiber: parsedFiber,
      min_stock: parsedMinStock,
      price: parsedPrice,
    });

    res.status(201).json({
      success: true,
      message: "Feed created successfully",
      feed
    });
  } catch (err) {
    console.error("Error creating feed:", err);

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        errors: getValidationErrors(err)
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || "Failed to create feed"
    });
  }
};
// Get all feeds
exports.getAllFeeds = async (req, res) => {
  try {
    const feeds = await Feed.findAll({
      include: {
        model: FeedType,
        as: "feedType", // Sesuaikan alias sesuai definisi pada model
        attributes: ["id", "name"],
      },
    });
    
    res.status(200).json({ success: true, feeds });
  } catch (err) {
    console.error("Error fetching feeds:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get feed by ID
exports.getFeedById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, field: "id", message: "Invalid ID format" });
  }

  try {
    const feed = await Feed.findOne({
      where: { id },
      include: {
        model: FeedType,
        as: "feedType",
        attributes: ["id", "name"],
      },
    });

    if (!feed) {
      return res.status(404).json({ success: false, field: "id", message: "Feed not found" });
    }

    res.status(200).json({ success: true, feed });
  } catch (err) {
    console.error("Error fetching feed:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update feed by ID
exports.updateFeed = async (req, res) => {
  const { id } = req.params;
  const { typeId, name, protein, energy, fiber, min_stock, price } = req.body;

  try {
    const feed = await Feed.findByPk(id);
    if (!feed) {
      return res.status(404).json({ success: false, field: "id", message: "Feed not found" });
    }

    if (typeId) {
      const feedType = await FeedType.findByPk(typeId);
      if (!feedType) {
        return res.status(404).json({ success: false, field: "typeId", message: "Feed type not found" });
      }
    }

    await feed.update({ typeId, name, protein, energy, fiber, min_stock, price });
    res.status(200).json({ success: true, message: "Feed updated successfully", feed });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, errors: getValidationErrors(err) });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete feed by ID
exports.deleteFeed = async (req, res) => {
  const { id } = req.params;

  try {
    const feed = await Feed.findByPk(id);
    if (!feed) {
      return res.status(404).json({ success: false, field: "id", message: "Feed not found" });
    }

    await feed.destroy();
    res.status(200).json({ success: true, message: "Feed deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};