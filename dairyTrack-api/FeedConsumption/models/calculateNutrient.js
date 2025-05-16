const DailyFeedItems = require("./dailyFeedItemsModel");
const Feed = require("./feedModel");
const Nutrisi = require("./nutritionModel");
const DailyFeedSchedule = require("./dailyFeedSchedule");

async function calculateTotalNutrients(dailyFeedId) {
  try {
    const feedItems = await DailyFeedItems.findAll({
      where: { daily_feed_id: dailyFeedId },
      include: [
        {
          model: Feed,
          include: [
            {
              model: Nutrisi,
              through: { attributes: ["amount"] },
            },
          ],
        },
      ],
    });

    const totalNutrients = {};
    for (const item of feedItems) {
      const quantity = parseFloat(item.quantity);
      for (const nutrisi of item.Feed.Nutrisis) {
        const nutrientName = nutrisi.name;
        const amount = parseFloat(nutrisi.FeedNutrisi.amount);
        totalNutrients[nutrientName] =
          (totalNutrients[nutrientName] || 0) + quantity * amount;
      }
    }

    await DailyFeedSchedule.update(
      { total_nutrients: totalNutrients },
      { where: { id: dailyFeedId } }
    );
  } catch (error) {
    console.error("Error calculating total nutrients:", {
      error: error.message,
      stack: error.stack,
    });
  }
}

module.exports = { calculateTotalNutrients };