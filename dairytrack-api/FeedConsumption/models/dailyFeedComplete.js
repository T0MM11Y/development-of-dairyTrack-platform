const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DailyFeedComplete = sequelize.define(
  "daily_feed_complete",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    farmer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    session: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    weather: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    total_protein: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_energy: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_fiber: {
      type: DataTypes.DECIMAL(10, 2),
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = DailyFeedComplete;