const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FeedStock = require("./feedStockModel");
const DailyFeedNutrients = require("./dailyFeedNutrients");

const DailyFeedDetail = sequelize.define(
  "DailyFeedDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    daily_feed_id: { // Menggunakan daily_feed_id sebagai FK ke daily_feed_sessions (atau tabel terkait)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    weather: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Unknown",
    },
    session: { // ENUM untuk sesi: pagi, siang, sore
      type: DataTypes.ENUM('pagi', 'siang', 'sore'),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
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

DailyFeedDetail.belongsTo(DailyFeedSession, { foreignKey: 'daily_feed_id' });
DailyFeedDetail.belongsTo(FeedStock, { foreignKey: 'feed_id' });

DailyFeedDetail.addHook("afterCreate", async (detail, options) => {
  try {
    // Ambil data feed dari FeedStock untuk mendapatkan nilai nutrisi
    const feedStock = await FeedStock.findOne({ where: { id: detail.feed_id } });
    if (!feedStock) {
      console.warn(`FeedStock tidak ditemukan untuk feed_id: ${detail.feed_id}`);
      return;
    }

    // Hitung total nutrisi berdasarkan quantity * nilai dari feedStock
    const totalProtein = parseFloat(feedStock.protein) * parseFloat(detail.quantity);
    const totalEnergy = parseFloat(feedStock.energy) * parseFloat(detail.quantity);
    const totalFiber = parseFloat(feedStock.fiber) * parseFloat(detail.quantity);

    // Kurangi stok pakan
    feedStock.stock = parseFloat(feedStock.stock) - parseFloat(detail.quantity);
    await feedStock.save();

    // Cari apakah sudah ada record DailyFeedNutrients untuk daily_feed_session_id yang bersangkutan
    let nutrients = await DailyFeedNutrients.findOne({
      where: { daily_feed_session_id: detail.daily_feed_id },
    });

    if (nutrients) {
      // Update nilai total nutrisi jika record sudah ada
      nutrients.total_protein += totalProtein;
      nutrients.total_energy += totalEnergy;
      nutrients.total_fiber += totalFiber;
      await nutrients.save();
    } else {
      // Buat record baru jika belum ada
      await DailyFeedNutrients.create({
        daily_feed_session_id: detail.daily_feed_id,
        total_protein: totalProtein,
        total_energy: totalEnergy,
        total_fiber: totalFiber,
      });
    }

    console.log(`✅ Nutrisi berhasil diperbarui untuk sesi ${detail.daily_feed_id}`);
  } catch (error) {
    console.error("❌ Error in afterCreate hook for DailyFeedDetail:", error);
  }
});

module.exports = DailyFeedDetail;
