const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const DailyFeedComplete = require("./dailyFeedComplete");
const Feed = require("./feedModel");

const DailyFeedItems = sequelize.define(
  "DailyFeedItems",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    daily_feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "daily_feed_complete", // Pastikan ini sesuai dengan nama tabel di database
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "feeds", // Pastikan ini sesuai dengan nama tabel di database
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "daily_feed_items", // Pastikan tidak diubah otomatis oleh Sequelize
    timestamps: false,
  }
);

// Definisi relasi
DailyFeedComplete.hasMany(DailyFeedItems, {
  foreignKey: "daily_feed_id",
  as: "feedItems",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

DailyFeedItems.belongsTo(DailyFeedComplete, {
  foreignKey: "daily_feed_id",
  as: "feedSession",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Relasi dengan Feed
DailyFeedItems.belongsTo(Feed, {
  foreignKey: "feed_id",
  as: "feed"
});

module.exports = DailyFeedItems;