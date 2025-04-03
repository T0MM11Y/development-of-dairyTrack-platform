const { Op } = require("sequelize");
const Nutrisi = require("../models/dailyFeedNutrients");
const DailyFeedComplete = require("../models/dailyFeedComplete");
const DailyFeedItems = require("../models/dailyFeedItemsModel");
const Feed = require("../models/feedModel");
const sequelize = require("../config/database");

// Fungsi untuk menghitung dan menyimpan nutrisi
exports.calculateAndSaveNutrisi = async (daily_feed_id) => {
  const t = await sequelize.transaction();
  
  try {
    // Find all feed items for this daily feed
    const feedItems = await DailyFeedItems.findAll({ 
      where: { daily_feed_id },
      include: [{
        model: Feed,
        as: 'feed',
        attributes: ['protein', 'energy', 'fiber']
      }],
      transaction: t
    });

    let totalProtein = 0;
    let totalEnergy = 0;
    let totalFiber = 0;

    // Calculate totals based on feed items
    for (let item of feedItems) {
      if (item.feed) {
        totalProtein += (parseFloat(item.feed.protein) || 0) * parseFloat(item.quantity);
        totalEnergy += (parseFloat(item.feed.energy) || 0) * parseFloat(item.quantity);
        totalFiber += (parseFloat(item.feed.fiber) || 0) * parseFloat(item.quantity);
      }
    }

    // Round values to 2 decimal places
    totalProtein = parseFloat(totalProtein.toFixed(2));
    totalEnergy = parseFloat(totalEnergy.toFixed(2));
    totalFiber = parseFloat(totalFiber.toFixed(2));

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

    // Create or update nutrisi record
    const [nutrisi, created] = await Nutrisi.findOrCreate({
      where: { daily_feed_id },
      defaults: {
        total_protein: totalProtein,
        total_energy: totalEnergy,
        total_fiber: totalFiber
      },
      transaction: t
    });

    // If record already exists, update it
    if (!created) {
      await nutrisi.update({
        total_protein: totalProtein,
        total_energy: totalEnergy,
        total_fiber: totalFiber
      }, { transaction: t });
    }

    await t.commit();
    console.log(`Nutrisi diperbarui untuk Daily Feed ID ${daily_feed_id}: Protein = ${totalProtein}, Energi = ${totalEnergy}, Fiber = ${totalFiber}`);
    return { totalProtein, totalEnergy, totalFiber };
  } catch (error) {
    await t.rollback();
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