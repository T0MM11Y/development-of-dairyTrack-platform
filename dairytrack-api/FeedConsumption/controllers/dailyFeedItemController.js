const DailyFeedComplete = require("../models/dailyFeedComplete");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require('../models/feedModel'); 
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { calculateAndSaveNutrisi } = require("./dailyFeedNutrientsController");

// ** ADD FEED ITEM (Tambah Item Pakan) **
exports.addFeedItem = async (req, res) => {
    const { daily_feed_id, feed_items } = req.body;
    const t = await sequelize.transaction();

    try {
        if (!daily_feed_id || !Array.isArray(feed_items) || feed_items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "Semua field diperlukan dan feed_items harus berupa array" });
        }

        const feed = await DailyFeedComplete.findByPk(daily_feed_id, { transaction: t });
        if (!feed) {
            await t.rollback();
            return res.status(404).json({ message: "Daily feed not found" });
        }

        const addedItems = [];

        for (let i = 0; i < feed_items.length; i++) {
            const { feed_id, quantity } = feed_items[i];

            if (!feed_id || !quantity) {
                continue;
            }

            const feedData = await Feed.findByPk(feed_id, { transaction: t });
            if (!feedData) {
                continue;
            }

            const newItem = await DailyFeedItems.create(
                { daily_feed_id, feed_id, quantity }, 
                { transaction: t }
            );
            
            addedItems.push(newItem);
        }

        await t.commit();
        
        // Calculate nutrition after committing the transaction
        if (addedItems.length > 0) {
            await calculateAndSaveNutrisi(daily_feed_id);
            
            // Get updated daily feed with nutritional values
            const updatedFeed = await DailyFeedComplete.findByPk(daily_feed_id, {
                include: [{
                    model: DailyFeedItems,
                    as: 'feedItems',
                    include: [{
                        model: Feed,
                        as: 'feed',
                        attributes: ['name', 'protein', 'energy', 'fiber']
                    }]
                }]
            });
            
            return res.status(201).json({ 
                success: true, 
                message: "Feed items berhasil ditambahkan dan nutrisi diperbarui",
                data: updatedFeed
            });
        }
        
        return res.status(201).json({ 
            success: true, 
            message: "Feed items berhasil ditambahkan",
            data: addedItems
        });
    } catch (error) {
        console.error("Error adding multiple feed items:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ** GET ALL FEED ITEMS (Ambil Semua Item Pakan) **
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
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }
      ],
      order: [['id', 'ASC']]
    });
    
    return res.status(200).json({ 
      success: true, 
      count: items.length,
      data: items 
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** GET FEED ITEM BY ID (Ambil Item Pakan Berdasarkan ID) **
exports.getFeedItemById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const item = await DailyFeedItems.findByPk(id, {
      include: [
        {
          model: Feed,
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }
      ]
    });
    
    if (!item) {
      return res.status(404).json({ message: "Feed item not found" });
    }
    
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** GET FEED ITEMS BY DAILY FEED ID (Ambil Item Pakan Berdasarkan Daily Feed ID) **
exports.getFeedItemsByDailyFeedId = async (req, res) => {
  const { daily_feed_id } = req.params;
  
  try {
    // Pastikan daily feed ada
    const feed = await DailyFeedComplete.findByPk(daily_feed_id);
    if (!feed) {
      return res.status(404).json({ message: "Daily feed not found" });
    }
    
    // Ambil feed items
    const feedItems = await DailyFeedItems.findAll({
      where: { daily_feed_id },
      include: [
        {
          model: Feed,
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }
      ]
    });
    
    return res.status(200).json({ 
      success: true, 
      count: feedItems.length,
      data: feedItems 
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** UPDATE FEED ITEM (Perbarui Item Pakan) **
exports.updateFeedItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const t = await sequelize.transaction();
  
  try {
    const item = await DailyFeedItems.findByPk(id, { transaction: t });
    
    if (!item) {
      await t.rollback();
      return res.status(404).json({ message: "Feed item not found" });
    }

    // Update item pakan
    await item.update({ quantity }, { transaction: t });
    await t.commit();
    
    // Recalculate nutrition after committing the transaction
    await calculateAndSaveNutrisi(item.daily_feed_id);
    
    // Get updated feed item
    const updatedItem = await DailyFeedItems.findByPk(id, {
      include: [
        {
          model: Feed,
          as: 'feed',
          attributes: ['name', 'protein', 'energy', 'fiber']
        }
      ]
    });

    return res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    await t.rollback();
    console.error("Error updating feed item:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ** DELETE FEED ITEM (Hapus Item Pakan) **
exports.deleteFeedItem = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  
  try {
    const item = await DailyFeedItems.findByPk(id, { transaction: t });
    
    if (!item) {
      await t.rollback();
      return res.status(404).json({ message: "Feed item not found" });
    }

    const daily_feed_id = item.daily_feed_id;
    
    // Hapus item pakan
    await item.destroy({ transaction: t });
    await t.commit();
    
    // Recalculate nutrition after committing the transaction
    await calculateAndSaveNutrisi(daily_feed_id);

    return res.status(200).json({ success: true, message: "Feed item deleted" });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting feed item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ** BULK UPDATE FEED ITEMS (Perbarui Beberapa Item Pakan) **
exports.bulkUpdateFeedItems = async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Array items diperlukan" });
  }
  
  const t = await sequelize.transaction();
  
  try {
    const results = [];
    const affectedDailyFeeds = new Set();
    
    for (const item of items) {
      const { id, quantity } = item;
      
      if (!id || !quantity) {
        continue;
      }
      
      const feedItem = await DailyFeedItems.findByPk(id, { transaction: t });
      
      if (feedItem) {
        await feedItem.update({ quantity }, { transaction: t });
        affectedDailyFeeds.add(feedItem.daily_feed_id);
        results.push({ id, success: true });
      } else {
        results.push({ id, success: false, message: "Item not found" });
      }
    }
    
    await t.commit();
    
    // Recalculate nutrition for all affected daily feeds after committing the transaction
    for (const daily_feed_id of affectedDailyFeeds) {
      await calculateAndSaveNutrisi(daily_feed_id);
    }
    
    return res.status(200).json({ 
      success: true, 
      results 
    });
  } catch (error) {
    await t.rollback();
    console.error("Error bulk updating feed items:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};