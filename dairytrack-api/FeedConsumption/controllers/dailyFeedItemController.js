const DailyFeedComplete = require("../models/dailyFeedComplete");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require('../models/feedModel'); 
const FeedStock = require('../models/feedStockModel');
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { calculateAndSaveNutrisi } = require("./dailyFeedNutrientsController");

// ** ADD FEED ITEM (Tambah Item Pakan) **
exports.addFeedItem = async (req, res) => {
  console.log("Request received:", req.body);
  const { daily_feed_id, feed_items } = req.body;
  let t;

  try {
      // Validate input
      if (!daily_feed_id || !Array.isArray(feed_items) || feed_items.length === 0) {
          return res.status(400).json({ 
              success: false,
              message: "Semua field diperlukan dan feed_items harus berupa array",
              received: { daily_feed_id, feed_items_length: feed_items ? feed_items.length : 0 }
          });
      }

      // First check if the daily feed exists before starting transaction
      const feed = await DailyFeedComplete.findByPk(daily_feed_id, {
          include: [{
              model: DailyFeedItems,
              as: 'feedItems'
          }]
      });
      
      if (!feed) {
          return res.status(404).json({ 
              success: false,
              message: "Sesi pakan harian tidak ditemukan" 
          });
      }

      // Check if feed already has 3 items (maximum limit)
      if (feed.feedItems && feed.feedItems.length >= 3) {
          return res.status(400).json({
              success: false,
              message: "Sesi pakan ini sudah memiliki 3 jenis pakan (maksimum)"
          });
      }

      // Check if the requested feed items would exceed the 3-item limit
      if (feed.feedItems && (feed.feedItems.length + feed_items.length > 3)) {
          return res.status(400).json({
              success: false,
              message: `Sesi pakan ini sudah memiliki ${feed.feedItems.length} jenis pakan. Anda hanya bisa menambahkan ${3 - feed.feedItems.length} lagi.`
          });
      }

      // Now start transaction for actual modifications
      t = await sequelize.transaction();
      
      const addedItems = [];
      const errors = [];

      // Check for duplicate feed items in request
      const feedIdsInRequest = feed_items.map(item => item.feed_id);
      const uniqueFeedIds = [...new Set(feedIdsInRequest)];
      
      if (feedIdsInRequest.length !== uniqueFeedIds.length) {
        // Find duplicate feed_ids
        const feedIdCounts = {};
        feedIdsInRequest.forEach(id => {
            feedIdCounts[id] = (feedIdCounts[id] || 0) + 1;
        });
        const duplicateFeedIds = Object.keys(feedIdCounts)
            .filter(id => feedIdCounts[id] > 1)
            .map(Number);
    
        // Fetch names of duplicate feeds
        const duplicateFeedNames = await Feed.findAll({
            where: { id: duplicateFeedIds },
            attributes: ['id', 'name']
        });
    
        await t.rollback();
        return res.status(400).json({
            success: false,
            message: `Terdapat jenis pakan yang sama dalam permintaan: ${duplicateFeedNames.map(feed => feed.name).join(', ')}. Pilih jenis pakan yang berbeda.`,
            duplicates: duplicateFeedNames.map(feed => ({ id: feed.id, name: feed.name }))
        });
    }

      // Check if any of the requested feed_ids already exist in this daily feed
      if (feed.feedItems && feed.feedItems.length > 0) {
          const existingFeedIds = feed.feedItems.map(item => item.feed_id);
          const duplicateFeedIds = feedIdsInRequest.filter(id => existingFeedIds.includes(id));
          
          if (duplicateFeedIds.length > 0) {
              const duplicateFeedNames = await Feed.findAll({
                  where: { id: duplicateFeedIds },
                  attributes: ['id', 'name']
              });
              
              await t.rollback();
              return res.status(400).json({
                  success: false,
                  message: "Beberapa jenis pakan sudah ada dalam sesi ini",
                  duplicates: duplicateFeedNames.map(feed => feed.name).join(', ')
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

              // Check if feed exists
              const feedData = await Feed.findByPk(feed_id);
              if (!feedData) {
                  errors.push({ feed_id, error: "Jenis pakan tidak ditemukan" });
                  continue;
              }

              // Convert quantity to number and validate
              const qtyNum = parseFloat(quantity);
              if (isNaN(qtyNum) || qtyNum <= 0) {
                  errors.push({ feed_id, feed_name: feedData.name, error: "Jumlah harus lebih dari 0" });
                  continue;
              }

              // Check and update stock
              const feedStock = await FeedStock.findOne({ 
                  where: { feedId: feed_id },
                  transaction: t
              });
              
              if (!feedStock) {
                  errors.push({ feed_id, feed_name: feedData.name, error: "Stok untuk pakan ini tidak ditemukan" });
                  continue;
              }
              
              if (parseFloat(feedStock.stock) < qtyNum) {
                  errors.push({ 
                      feed_id, 
                      feed_name: feedData.name, 
                      error: `Stok tidak cukup untuk ${feedData.name}. Tersedia: ${feedStock.stock}kg, Diminta: ${qtyNum}kg` 
                  });
                  continue;
              }
              
              // Reduce stock
              const newStockAmount = parseFloat(feedStock.stock) - qtyNum;
              await feedStock.update({ stock: newStockAmount }, { transaction: t });

              // Create new item
              const newItem = await DailyFeedItems.create(
                  { 
                      daily_feed_id, 
                      feed_id, 
                      quantity: qtyNum
                  }, 
                  { transaction: t }
              );
              
              // Add complete item info for response
              const createdItem = {
                  ...newItem.get({ plain: true }),
                  feed: {
                      name: feedData.name,
                      protein: feedData.protein,
                      energy: feedData.energy,
                      fiber: feedData.fiber
                  }
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
              errors 
          });
      }

      await t.commit();
      
      // Calculate nutrition after committing the transaction
      try {
          await calculateAndSaveNutrisi(daily_feed_id);
      } catch (nutriError) {
          console.error("Error calculating nutrition:", nutriError);
          // Continue without returning error since items were added successfully
      }
      
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
          message: `${addedItems.length} jenis pakan berhasil ditambahkan dan nutrisi diperbarui`,
          errors: errors.length > 0 ? errors : undefined,
          data: updatedFeed
      });
  } catch (error) {
      if (t) await t.rollback();
      console.error("Error adding feed items:", error);
      return res.status(500).json({ 
          success: false,
          message: "Terjadi kesalahan pada server", 
          error: error.message 
      });
  }
};

// ** UPDATE FEED ITEM (Perbarui Item Pakan) **
exports.updateFeedItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const t = await sequelize.transaction();
  
  try {
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: "Jumlah harus berupa angka lebih dari 0" 
      });
    }

    const item = await DailyFeedItems.findByPk(id, { 
      transaction: t,
      include: [{
        model: Feed,
        as: 'feed',
        attributes: ['name']
      }]
    });
    
    if (!item) {
      await t.rollback();
      return res.status(404).json({ 
        success: false,
        message: "Item pakan tidak ditemukan" 
      });
    }

    // Get the current quantity to calculate the difference
    const oldQuantity = parseFloat(item.quantity);
    const newQuantity = parseFloat(quantity);
    const quantityDifference = newQuantity - oldQuantity;
    
    // Handle stock update
    if (quantityDifference !== 0) {
      const feedStock = await FeedStock.findOne({ 
        where: { feedId: item.feed_id },
        transaction: t
      });
      
      if (!feedStock) {
        await t.rollback();
        return res.status(404).json({ 
          success: false,
          message: "Stok pakan tidak ditemukan" 
        });
      }
      
      // If increasing quantity, check if we have enough stock
      if (quantityDifference > 0) {
        if (parseFloat(feedStock.stock) < quantityDifference) {
          await t.rollback();
          return res.status(400).json({ 
            success: false,
            message: `Stok tidak cukup untuk ${item.feed ? item.feed.name : 'item ini'}. Tersedia: ${feedStock.stock}kg, Tambahan yang dibutuhkan: ${quantityDifference}kg` 
          });
        }
      }
      
      // Update stock - decrease if quantity increased, increase if quantity decreased
      const newStockAmount = parseFloat(feedStock.stock) - quantityDifference;
      await feedStock.update({ stock: newStockAmount }, { transaction: t });
    }

    // Update item pakan
    await item.update({ quantity: newQuantity }, { transaction: t });
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

    return res.status(200).json({ 
      success: true, 
      message: "Item pakan berhasil diperbarui",
      data: updatedItem 
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating feed item:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

// ** DELETE FEED ITEM (Hapus Item Pakan) **
exports.deleteFeedItem = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  
  try {
    const item = await DailyFeedItems.findByPk(id, { 
      transaction: t,
      include: [{
        model: Feed,
        as: 'feed',
        attributes: ['name']
      }]
    });
    
    if (!item) {
      await t.rollback();
      return res.status(404).json({ 
        success: false,
        message: "Item pakan tidak ditemukan" 
      });
    }

    const daily_feed_id = item.daily_feed_id;
    const feedId = item.feed_id;
    const feedName = item.feed ? item.feed.name : 'item ini';
    const deletedQuantity = parseFloat(item.quantity);
    
    // Return the quantity to stock
    const feedStock = await FeedStock.findOne({ 
      where: { feedId: feedId },
      transaction: t
    });
    
    if (feedStock) {
      const newStockAmount = parseFloat(feedStock.stock) + deletedQuantity;
      await feedStock.update({ stock: newStockAmount }, { transaction: t });
    }
    
    // Hapus item pakan
    await item.destroy({ transaction: t });
    await t.commit();
    
    // Recalculate nutrition after committing the transaction
    await calculateAndSaveNutrisi(daily_feed_id);

    return res.status(200).json({ 
      success: true, 
      message: `${feedName} berhasil dihapus dan stok dikembalikan sebanyak ${deletedQuantity}kg` 
    });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting feed item:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};

// ** BULK UPDATE FEED ITEMS (Perbarui Beberapa Item Pakan) **
exports.bulkUpdateFeedItems = async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Array items diperlukan" 
    });
  }
  
  const t = await sequelize.transaction();
  
  try {
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
        include: [{
          model: Feed,
          as: 'feed',
          attributes: ['name']
        }]
      });
      
      if (feedItem) {
        const oldQuantity = parseFloat(feedItem.quantity);
        const newQuantity = parseFloat(quantity);
        
        if (isNaN(newQuantity) || newQuantity <= 0) {
          results.push({ id, success: false, message: "Jumlah harus lebih dari 0" });
          continue;
        }
        
        const quantityDifference = newQuantity - oldQuantity;
        const feedName = feedItem.feed ? feedItem.feed.name : `Item ID ${id}`;
        
        // Handle stock update if quantity changed
        if (quantityDifference !== 0) {
          const feedStock = await FeedStock.findOne({ 
            where: { feedId: feedItem.feed_id },
            transaction: t
          });
          
          if (!feedStock) {
            results.push({ id, success: false, message: `Stok untuk ${feedName} tidak ditemukan` });
            continue;
          }
          
          // If increasing quantity, check if we have enough stock
          if (quantityDifference > 0) {
            if (parseFloat(feedStock.stock) < quantityDifference) {
              results.push({ 
                id, 
                success: false, 
                message: `Stok tidak cukup untuk ${feedName}. Tersedia: ${feedStock.stock}kg, Tambahan yang dibutuhkan: ${quantityDifference}kg` 
              });
              continue;
            }
          }
          
          // Update stock - decrease if quantity increased, increase if quantity decreased
          const newStockAmount = parseFloat(feedStock.stock) - quantityDifference;
          await feedStock.update({ stock: newStockAmount }, { transaction: t });
        }
        
        await feedItem.update({ quantity: newQuantity }, { transaction: t });
        affectedDailyFeeds.add(feedItem.daily_feed_id);
        results.push({ id, success: true, message: `${feedName} berhasil diperbarui` });
      } else {
        results.push({ id, success: false, message: "Item tidak ditemukan" });
      }
    }
    
    // If all updates failed, rollback the transaction
    if (results.every(result => !result.success)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Tidak ada item yang berhasil diperbarui",
        results
      });
    }
    
    await t.commit();
    
    // Recalculate nutrition for all affected daily feeds after committing the transaction
    for (const daily_feed_id of affectedDailyFeeds) {
      await calculateAndSaveNutrisi(daily_feed_id);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `${results.filter(r => r.success).length} dari ${results.length} item berhasil diperbarui`,
      results 
    });
  } catch (error) {
    await t.rollback();
    console.error("Error bulk updating feed items:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

// Keep other functions from the original file
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
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

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
      return res.status(404).json({ 
        success: false,
        message: "Item pakan tidak ditemukan" 
      });
    }
    
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

exports.getFeedItemsByDailyFeedId = async (req, res) => {
  const { daily_feed_id } = req.params;
  
  try {
    // Pastikan daily feed ada
    const feed = await DailyFeedComplete.findByPk(daily_feed_id);
    if (!feed) {
      return res.status(404).json({ 
        success: false,
        message: "Sesi pakan harian tidak ditemukan" 
      });
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
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

exports.getFeedUsageByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Validate date inputs
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

    // Build date filter
    const whereClause = {};
    if (start_date || end_date) {
      whereClause['$feedSession.date$'] = {};
      if (start_date) {
        whereClause['$feedSession.date$'][Op.gte] = start_date;
      }
      if (end_date) {
        whereClause['$feedSession.date$'][Op.lte] = end_date;
      }
    }

    // Query feed usage by date
    const feedUsage = await DailyFeedItems.findAll({
      attributes: [
        [sequelize.col('feedSession.date'), 'date'],
        'feed_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
      ],
      include: [
        {
          model: Feed,
          as: 'feed',
          attributes: ['name'],
        },
        {
          model: DailyFeedComplete,
          as: 'feedSession',
          attributes: [],
          where: whereClause['$feedSession.date$'] ? {
            date: whereClause['$feedSession.date$'],
          } : undefined,
        },
      ],
      group: ['feedSession.date', 'feed_id', 'feed.id', 'feed.name'],
      order: [[sequelize.col('feedSession.date'), 'ASC']],
    });

    // Format response
    const formattedData = [];
    const dateMap = {};

    feedUsage.forEach((item) => {
      const date = item.dataValues.date;
      const feedData = {
        feed_id: item.feed_id,
        feed_name: item.feed.name,
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

    // Sort formattedData by date to ensure consistent order
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
