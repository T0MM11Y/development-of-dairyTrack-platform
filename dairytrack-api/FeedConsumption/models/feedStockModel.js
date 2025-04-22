const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Impor model lain untuk digunakan di hook
// Ini aman karena asosiasi didefinisikan di associations.js
const Feed = require("./feedModel");
const Notification = require("./notificationModel");

const FeedStock = sequelize.define(
  "FeedStock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    feedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "feed_id",
    },
    stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Stock cannot be negative" },
      },
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
    const feed = await Feed.findByPk(feedStock.feedId);
    if (feed && parseFloat(feedStock.stock) <= parseFloat(feed.min_stock)) {
      const existingNotification = await Notification.findOne({
        where: {
          feed_stock_id: feedStock.id,
          is_read: false,
        },
      });

      if (!existingNotification) {
        // Konversi feedStock.stock menjadi integer menggunakan Math.floor()
        const stockAsInteger = Math.floor(parseFloat(feedStock.stock));
        const message = `Sisa stok ${feed.name} tinggal ${stockAsInteger} kg, silahkan tambah stok`;
        await Notification.create({
          feed_stock_id: feedStock.id,
          message: message,
          type: "warning",
        });
      }
    }
  } catch (error) {
    console.error("Error in afterUpdate hook for FeedStock:", {
      error: error.message,
      stack: error.stack,
    });
  }
});

module.exports = FeedStock;