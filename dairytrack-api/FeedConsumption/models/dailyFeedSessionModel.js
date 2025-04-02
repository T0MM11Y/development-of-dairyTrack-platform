const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DailyFeedSession = sequelize.define(
  "DailyFeedSession",
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
        model: "daily_feed", // nama tabel daily_feed
        key: "id",
      },
      onDelete: "CASCADE",
    },
    session: {
      type: DataTypes.ENUM("Pagi", "Siang", "Sore"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "daily_feed_sessions",
    timestamps: false, // karena hanya menggunakan kolom created_at
  }
);

module.exports = DailyFeedSession;
