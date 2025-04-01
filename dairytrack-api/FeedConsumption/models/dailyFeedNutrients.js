const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DailyFeedNutrients = sequelize.define(
  "DailyFeedNutrients",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    daily_feed_session_id: {  
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "daily_feed_sessions", 
        key: "id",
      },
      onDelete: "CASCADE",
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
    calculated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "daily_feed_nutrients",
    timestamps: false,
  }
);

DailyFeedNutrients.belongsTo(DailyFeedSession, { foreignKey: 'daily_feed_session_id' });

module.exports = DailyFeedNutrients;
