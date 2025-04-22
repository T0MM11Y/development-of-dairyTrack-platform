const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeedType = sequelize.define(
  "FeedType",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    tableName: "feed_type",
    timestamps: true,
  }
);

module.exports = FeedType;
