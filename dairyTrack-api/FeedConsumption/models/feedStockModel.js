// models/feedStockModel.js
const { DataTypes } = require("sequelize");
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
        if (!options.userId) {
          throw new Error("User ID is required for creating FeedStock");
        }
        feedStock.user_id = options.userId;
        feedStock.created_by = options.userId;
        feedStock.updated_by = options.userId;
      },
      beforeUpdate: async (feedStock, options) => {
        if (!options.userId) {
          throw new Error("User ID is required for updating FeedStock");
        }
        feedStock.updated_by = options.userId;
      },
      afterUpdate: async (feedStock, options) => {
        try {
          const Notification = sequelize.models.Notification;
          const Feed = sequelize.models.Feed;
          const feed = await Feed.findByPk(feedStock.feedId);
          if (feed && parseFloat(feedStock.stock) <= parseFloat(feed.min_stock)) {
            const existingNotification = await Notification.findOne({
              where: { feed_stock_id: feedStock.id },
              order: [["date", "DESC"]],
            });

            const shouldCreateNotification =
              !existingNotification ||
              (existingNotification &&
                new Date() - new Date(existingNotification.date) > 24 * 60 * 60 * 1000);

            if (shouldCreateNotification) {
              const stockAsInteger = Math.floor(parseFloat(feedStock.stock));
              const message = `Sisa stok ${feed.name} tinggal ${stockAsInteger}kg, silahkan tambah stok`;
              await Notification.create({
                feed_stock_id: feedStock.id,
                message,
                date: new Date(),
              });
              console.log(`Created notification for low stock of ${feed.name}`);
            }
          }
        } catch (error) {
          console.error("Error in afterUpdate hook for FeedStock:", {
            error: error.message,
            stack: error.stack,
          });
        }
      },
    },
  }
);

module.exports = FeedStock;