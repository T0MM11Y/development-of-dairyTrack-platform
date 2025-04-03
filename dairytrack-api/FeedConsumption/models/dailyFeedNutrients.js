const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Nutrisi = sequelize.define(
  "nutrisi",
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
        model: "daily_feed_completes", // Mengacu pada tabel daily_feed_completes
        key: "id",
      },
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Nutrisi;
