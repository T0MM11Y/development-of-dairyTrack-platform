const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/database");

const FeedStock = sequelize.define(
  "FeedStock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Stock is required" },
        isDecimal: { msg: "Stock must be a decimal number" },
        min: { args: [0], msg: "Stock cannot be negative" },
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "feed_stock",
    timestamps: true,
    hooks: {
      beforeCreate: async (feedStock, options) => {
        console.log("beforeCreate hook triggered", { feedStock: feedStock.toJSON(), options });
        if (!options.userId) {
          throw new Error("User ID is required for creating FeedStock");
        }
        feedStock.user_id = options.userId;
        feedStock.created_by = options.userId;
        feedStock.updated_by = options.userId;
      },
      beforeUpdate: async (feedStock, options) => {
        console.log("beforeUpdate hook triggered", { feedStock: feedStock.toJSON(), options });
        if (!options.userId) {
          throw new Error("User ID is required for updating FeedStock");
        }
        feedStock.updated_by = options.userId;
      },
      afterCreate: async (feedStock, options) => {
        try {
          console.log("afterCreate hook triggered", {
            feedStockId: feedStock.id,
            stock: feedStock.stock,
            feedId: feedStock.feedId,
          });
          const Notification = sequelize.models.Notification;
          const Feed = sequelize.models.Feed;
          const feed = await Feed.findByPk(feedStock.feedId);
          if (!feed) {
            console.error("Feed not found for feedId:", feedStock.feedId);
            return;
          }
          console.log("Feed found", {
            feedId: feed.id,
            name: feed.name,
            min_stock: feed.min_stock,
            unit: feed.unit,
          });
          const stock = parseFloat(feedStock.stock);
          const minStock = parseFloat(feed.min_stock);
          if (isNaN(stock) || isNaN(minStock)) {
            console.error("Invalid stock or minStock values", { stock, minStock });
            return;
          }
          console.log("Stock comparison", { stock, minStock, isLow: stock <= minStock });
          if (stock <= minStock) {
            const stockAsInteger = Math.floor(stock);
            const message = `Pakan ${feed.name} sisa ${stockAsInteger} ${feed.unit}, segera tambah pakan!!`;
            const notification = await Notification.create({
              feed_stock_id: feedStock.id,
              message,
              created_at: new Date(),
              type: "Sisa Pakan Menipis",
              is_read: false,
            });
            console.log("Created notification", {
              notificationId: notification.id,
              message,
            });
          }
        } catch (error) {
          console.error("Error in afterCreate hook for FeedStock:", {
            error: error.message,
            stack: error.stack,
            feedStockId: feedStock.id,
          });
        }
      },
      afterUpdate: async (feedStock, options) => {
        try {
          console.log("afterUpdate hook triggered", {
            feedStockId: feedStock.id,
            stock: feedStock.stock,
            feedId: feedStock.feedId,
          });
          const Notification = sequelize.models.Notification;
          const Feed = sequelize.models.Feed;
          const feed = await Feed.findByPk(feedStock.feedId);
          if (!feed) {
            console.error("Feed not found for feedId:", feedStock.feedId);
            return;
          }
          console.log("Feed found", {
            feedId: feed.id,
            name: feed.name,
            min_stock: feed.min_stock,
            unit: feed.unit,
          });
          const stock = parseFloat(feedStock.stock);
          const minStock = parseFloat(feed.min_stock);
          if (isNaN(stock) || isNaN(minStock)) {
            console.error("Invalid stock or minStock values", { stock, minStock });
            return;
          }
          console.log("Stock comparison", { stock, minStock, isLow: stock <= minStock });
          if (stock <= minStock) {
            const stockAsInteger = Math.floor(stock);
            const message = `Pakan ${feed.name} sisa ${stockAsInteger} ${feed.unit}, segera tambah pakan!!`;
            const notification = await Notification.create({
              feed_stock_id: feedStock.id,
              message,
              created_at: new Date(),
              type: "Sisa Pakan Menipis",
              is_read: false,
            });
            console.log("Created notification", {
              notificationId: notification.id,
              message,
            });
          }
        } catch (error) {
          console.error("Error in afterUpdate hook for FeedStock:", {
            error: error.message,
            stack: error.stack,
            feedStockId: feedStock.id,
          });
        }
      },
    },
  }
);

module.exports = FeedStock;