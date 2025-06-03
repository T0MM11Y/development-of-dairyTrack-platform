const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeedStockHistory = sequelize.define(
  "FeedStockHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    feedStockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "feed_stock_id",
      references: {
        model: "feed_stock",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      validate: {
        notNull: { msg: "Feed Stock ID is required" },
        isInt: { msg: "Feed Stock ID must be an integer" },
      },
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
      },
    },
    action: {
      type: DataTypes.ENUM("CREATE", "UPDATE"),
      allowNull: false,
      validate: {
        notNull: { msg: "Action type is required" },
        isIn: {
          args: [["CREATE", "UPDATE"]],
          msg: "Action must be either CREATE or UPDATE",
        },
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
    previousStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "previous_stock",
      validate: {
        isDecimal: { msg: "Previous stock must be a decimal number" },
        min: { args: [0], msg: "Previous stock cannot be negative" },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "feed_stock_history",
    timestamps: false,
  }
);

module.exports = FeedStockHistory;