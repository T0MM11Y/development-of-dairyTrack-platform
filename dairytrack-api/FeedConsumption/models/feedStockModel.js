const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Feed = require("./feedModel");

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
      references: {
        model: "feed",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      validate: {
        notNull: { msg: "Feed ID is required" },
        isInt: { msg: "Feed ID must be an integer" },
      },
    },
    stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Stock is required" },
        isDecimal: { msg: "Stock must be a decimal number" },
        min: { args: [0], msg: "Stock cannot be negative" },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "feed_stock",
    timestamps: true,
  }
);

// Hook untuk membuat notifikasi jika stok rendah
FeedStock.addHook("afterUpdate", async (feedStock, options) => {
  try {
    // Import here to avoid circular dependency
    const Notification = require("./notificationModel");
    
    const feed = await Feed.findByPk(feedStock.feedId);
    if (feed && parseFloat(feedStock.stock) <= parseFloat(feed.min_stock)) {
      const existingNotification = await Notification.findOne({
        where: {
          feed_stock_id: feedStock.id,
        },
        order: [['date', 'DESC']]
      });

      // Check if we need a new notification (if none exists or if the last one is old)
      const shouldCreateNotification = !existingNotification || 
        (existingNotification && 
         (new Date() - new Date(existingNotification.date)) > (24 * 60 * 60 * 1000)); // 24 hours

      if (shouldCreateNotification) {
        const stockAsInteger = Math.floor(parseFloat(feedStock.stock));
        const message = `Sisa stok ${feed.name} tinggal ${stockAsInteger}kg, silahkan tambah stok`;
        await Notification.create({
          feed_stock_id: feedStock.id,
          message: message,
          date: new Date()
        });
        console.log(`Created notification for low stock of ${feed.name}`);
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