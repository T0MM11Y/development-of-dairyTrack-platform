const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FeedStock = require("./feedStockModel");
const DailyFeedNutrients = require("./dailyFeedNutrients"); // Pastikan sudah diimport!

const DailyFeedDetail = sequelize.define(
  "DailyFeedDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    daily_feed_session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    weather: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Unknown",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "daily_feed_details",
    timestamps: false,
  }
);

// ✅ Hook afterCreate untuk update DailyFeedNutrients
DailyFeedDetail.addHook("afterCreate", async (detail, options) => {
  try {
    const feedStock = await FeedStock.findOne({ where: { id: detail.feed_id } });

    if (!feedStock) {
      console.warn(`FeedStock tidak ditemukan untuk feed_id: ${detail.feed_id}`);
      return;
    }

    const totalProtein = parseFloat(feedStock.protein) * parseFloat(detail.quantity);
    const totalEnergy = parseFloat(feedStock.energy) * parseFloat(detail.quantity);
    const totalFiber = parseFloat(feedStock.fiber) * parseFloat(detail.quantity);

    feedStock.stock = parseFloat(feedStock.stock) - parseFloat(detail.quantity);
    await feedStock.save();

    let nutrients = await DailyFeedNutrients.findOne({
      where: { daily_feed_session_id: detail.daily_feed_session_id },
    });

    if (nutrients) {
      nutrients.total_protein += totalProtein;
      nutrients.total_energy += totalEnergy;
      nutrients.total_fiber += totalFiber;
      await nutrients.save();
    } else {
      await DailyFeedNutrients.create({
        daily_feed_session_id: detail.daily_feed_session_id,
        total_protein: totalProtein,
        total_energy: totalEnergy,
        total_fiber: totalFiber,
      });
    }

    console.log(`✅ Nutrisi berhasil diperbarui untuk sesi ${detail.daily_feed_session_id}`);
  } catch (error) {
    console.error("❌ Error in afterCreate hook for DailyFeedDetail:", error);
  }
});

module.exports = DailyFeedDetail;
