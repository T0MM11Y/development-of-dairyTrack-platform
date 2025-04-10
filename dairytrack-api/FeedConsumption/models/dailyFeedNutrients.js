const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Simplify model to match how it's used in controllers
const Nutrisi = sequelize.define(
  "daily_feed_nutrients", // Changed to match collection name likely used
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
        model: "daily_feed_complete",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    total_protein: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_energy: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_fiber: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    tableName: "daily_feed_nutrients", // Ensure consistent table name
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Add association
Nutrisi.belongsTo(require("./dailyFeedComplete"), {
  foreignKey: "daily_feed_id",
  as: "dailyFeed"
});

module.exports = Nutrisi;