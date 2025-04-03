const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Feed = require("./feedModel");
const Notification = require("./notificationModel"); // Tambahkan baris ini

const FeedStock = sequelize.define(
  "FeedStock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    feedId: { // properti JavaScript
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "feed_id",
    },
    stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: "feed_stock",
    timestamps: false,
  }
);

// Hook afterUpdate untuk membuat notifikasi jika stok sudah mendekati habis
FeedStock.addHook("afterUpdate", async (feedStock, options) => {
  try {
    if (parseFloat(feedStock.stock) <= parseFloat(feedStock.minStock)) {
      // Ambil data feed untuk mendapatkan nama feed
      const feed = await Feed.findByPk(feedStock.feedId);
      if (feed) {
        const message = `Stok ${feed.name} sudah mau habis, silahkan tambah stock`;
        // Buat notifikasi
        await Notification.create({
          feed_stock_id: feedStock.id,
          message: message,
          type: "warning",
        });
      }
    }
  } catch (error) {
    console.error("Error in afterUpdate hook for FeedStock:", error);
    // Tangani error agar tidak menggagalkan update utama
  }
});

module.exports = FeedStock;
