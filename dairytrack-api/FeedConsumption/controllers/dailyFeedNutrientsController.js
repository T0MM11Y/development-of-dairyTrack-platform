const { Op } = require("sequelize");
const Nutrisi = require("../models/dailyFeedNutrients");
const DailyFeedComplete = require("../models/dailyFeedComplete");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");
const sequelize = require("../config/database");

// Fungsi untuk menghitung dan menyimpan nutrisi
exports.calculateAndSaveNutrisi = async (daily_feed_id) => {
  let t;
  
  try {
    // First check if the daily feed exists
    const dailyFeed = await DailyFeedComplete.findByPk(daily_feed_id);
    if (!dailyFeed) {
      console.error(`Daily feed with ID ${daily_feed_id} not found`);
      return null;
    }
    
    // Find all feed items for this daily feed
    const feedItems = await DailyFeedItems.findAll({ 
      where: { daily_feed_id },
      include: [{
        model: Feed,
        as: 'feed',
        attributes: ['protein', 'energy', 'fiber']
      }]
    });

    console.log(`Found ${feedItems.length} feed items for daily_feed_id ${daily_feed_id}`);

    let totalProtein = 0;
    let totalEnergy = 0;
    let totalFiber = 0;

    // Calculate totals based on feed items
    for (let item of feedItems) {
      if (item.feed) {
        const quantity = parseFloat(item.quantity) || 0;
        const protein = parseFloat(item.feed.protein) || 0;
        const energy = parseFloat(item.feed.energy) || 0;
        const fiber = parseFloat(item.feed.fiber) || 0;
        
        totalProtein += protein * quantity;
        totalEnergy += energy * quantity;
        totalFiber += fiber * quantity;
        
        console.log(`Item: ${item.feed_id}, Qty: ${quantity}, Protein: ${protein}, Energy: ${energy}, Fiber: ${fiber}`);
      } else {
        console.log(`Warning: Feed data missing for item ${item.id}, feed_id: ${item.feed_id}`);
      }
    }

    // Round values to 2 decimal places
    totalProtein = parseFloat(totalProtein.toFixed(2));
    totalEnergy = parseFloat(totalEnergy.toFixed(2));
    totalFiber = parseFloat(totalFiber.toFixed(2));

    console.log(`Calculated totals - Protein: ${totalProtein}, Energy: ${totalEnergy}, Fiber: ${totalFiber}`);

    // Start transaction for updates
    t = await sequelize.transaction();

    // Update data nutrisi di DailyFeedComplete
    await DailyFeedComplete.update(
      { 
        total_protein: totalProtein, 
        total_energy: totalEnergy,
        total_fiber: totalFiber 
      },
      { 
        where: { id: daily_feed_id },
        transaction: t 
      }
    );

    // Check if Nutrisi model is properly defined and table exists
    try {
      // Try to find existing nutrisi record
      const existingNutrisi = await Nutrisi.findOne({
        where: { daily_feed_id }
      });
      
      if (existingNutrisi) {
        // Update if exists
        await existingNutrisi.update({
          total_protein: totalProtein,
          total_energy: totalEnergy,
          total_fiber: totalFiber
        }, { transaction: t });
      } else {
        // Create if not exists
        await Nutrisi.create({
          daily_feed_id,
          total_protein: totalProtein,
          total_energy: totalEnergy,
          total_fiber: totalFiber
        }, { transaction: t });
      }
    } catch (nutrisiError) {
      console.error("Error with Nutrisi table, skipping nutrisi update:", nutrisiError);
      // Continue execution even if nutrisi table update fails
    }

    await t.commit();
    console.log(`Nutrisi diperbarui untuk Daily Feed ID ${daily_feed_id}`);
    return { totalProtein, totalEnergy, totalFiber };
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error calculating and saving nutrition:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data nutrisi berdasarkan daily_feed_id
exports.getNutrisiByDailyFeedId = async (req, res) => {
  const { dailyFeedId } = req.params;

  try {
    const nutrisi = await Nutrisi.findOne({
      where: { daily_feed_id: dailyFeedId },
    });

    if (!nutrisi) {
      return res.status(404).json({ message: "Nutrisi not found." });
    }

    return res.json({
      success: true,
      data: nutrisi
    });
  } catch (error) {
    console.error("Error fetching nutrisi:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Fungsi untuk mendapatkan summary nutrisi
exports.getNutrisiSummary = async (req, res) => {
  const { cow_id, start_date, end_date } = req.query;
  
  try {
    // Find all daily feeds for the cow in date range
    const dailyFeeds = await DailyFeedComplete.findAll({
      where: {
        cow_id,
        date: {
          [Op.between]: [start_date, end_date]
        }
      }
    });
    
    const feedIds = dailyFeeds.map(feed => feed.id);
    
    // Get nutrisi data for these feeds
    const nutriData = await Nutrisi.findAll({
      where: {
        daily_feed_id: {
          [Op.in]: feedIds
        }
      }
    });
    
    // Calculate totals and averages
    const summary = {
      total_protein: 0,
      total_energy: 0,
      total_fiber: 0,
      avg_protein_per_day: 0,
      avg_energy_per_day: 0,
      avg_fiber_per_day: 0,
      days_count: 0
    };
    
    nutriData.forEach(item => {
      summary.total_protein += parseFloat(item.total_protein);
      summary.total_energy += parseFloat(item.total_energy);
      summary.total_fiber += parseFloat(item.total_fiber);
    });
    
    // Calculate number of unique days
    const uniqueDays = new Set(dailyFeeds.map(feed => feed.date));
    summary.days_count = uniqueDays.size;
    
    if (summary.days_count > 0) {
      summary.avg_protein_per_day = parseFloat((summary.total_protein / summary.days_count).toFixed(2));
      summary.avg_energy_per_day = parseFloat((summary.total_energy / summary.days_count).toFixed(2));
      summary.avg_fiber_per_day = parseFloat((summary.total_fiber / summary.days_count).toFixed(2));
    }
    
    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Error calculating nutrisi summary:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};