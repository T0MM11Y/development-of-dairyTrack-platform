const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,// Mendukung notifikasi global
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    cow_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Mendukung notifikasi global
      references: {
        model: "cows",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    feed_stock_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "feed_stock",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "order",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    product_stock_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "product_stock",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    milking_session_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "milking_sessions",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50), // Diperpanjang untuk mendukung "Sisa Pakan Menipis"
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Konsisten dengan SQL
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  }
);

module.exports = Notification;