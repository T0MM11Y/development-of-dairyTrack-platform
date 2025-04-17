const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DailyFeedItems = sequelize.define(
  "daily_feed_items", // Changed to match the table name used in controller
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
        model: "daily_feed_complete", // This should match your table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "feeds", // This should match your feeds table name
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2), // Changed from INTEGER to DECIMAL for more precision in feed quantities
      allowNull: false,
    },
  },
  {
    tableName: "daily_feed_items", // Ensure consistent table name
    timestamps: false,
  }
);

module.exports = DailyFeedItems;