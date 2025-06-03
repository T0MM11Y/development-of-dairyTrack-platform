const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FeedStock = require("./feedStockModel");
const DailyFeedSchedule = require("./dailyFeedSchedule");
const Feed = require("./feedModel");

const DailyFeedItems = sequelize.define(
  "DailyFeedItems",
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
        model: "daily_feed_schedule",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      validate: {
        notNull: { msg: "Daily feed ID is required" },
        isInt: { msg: "Daily feed ID must be an integer" },
      },
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "feed",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
      validate: {
        notNull: { msg: "Feed ID is required" },
        isInt: { msg: "Feed ID must be an integer" },
      },
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Quantity is required" },
        isDecimal: { msg: "Quantity must be a decimal number" },
        min: { args: [0.01], msg: "Quantity must be greater than 0" },
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
    tableName: "daily_feed_items",
    timestamps: true,
    hooks: {
      beforeCreate: async (item, options) => {
        console.log("Starting beforeCreate hook for DailyFeedItems", {
          feedId: item.feed_id,
          quantity: item.quantity,
          userId: options.userId,
          transactionId: options.transaction?.id,
        });
        const t = options.transaction;
        if (!options.userId) {
          throw new Error("User ID is required for creating DailyFeedItems");
        }
        item.created_by = options.userId;
        item.updated_by = options.userId;
        item.user_id = options.userId;

        const feedStock = await FeedStock.findOne({
          where: { feedId: item.feed_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!feedStock) {
          throw new Error(`Stok pakan dengan ID ${item.feed_id} tidak ditemukan`);
        }

        if (parseFloat(feedStock.stock) < parseFloat(item.quantity)) {
          throw new Error(`Stok tidak cukup untuk pakan dengan ID ${item.feed_id}. Stok tersedia: ${feedStock.stock} kg`);
        }

        const newStock = parseFloat(feedStock.stock) - parseFloat(item.quantity);
        await feedStock.update(
          { stock: newStock, updated_by: options.userId },
          { transaction: t, userId: options.userId }
        );
        console.log("FeedStock updated in beforeCreate", {
          feedId: item.feed_id,
          newStock,
          userId: options.userId,
        });
      },
      beforeUpdate: async (item, options) => {
        console.log("Starting beforeUpdate hook for DailyFeedItems", {
          feedId: item.feed_id,
          quantity: item.quantity,
          userId: options.userId,
          transactionId: options.transaction?.id,
        });
        const t = options.transaction;
        if (!options.userId) {
          throw new Error("User ID is required for updating DailyFeedItems");
        }
        item.updated_by = options.userId;

        const originalItem = await DailyFeedItems.findByPk(item.id, {
          transaction: t,
        });

        if (!originalItem) {
          throw new Error(`Item pakan dengan ID ${item.id} tidak ditemukan`);
        }

        const feedStock = await FeedStock.findOne({
          where: { feedId: originalItem.feed_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!feedStock) {
          throw new Error(`Stok pakan dengan ID ${originalItem.feed_id} tidak ditemukan`);
        }

        const originalQty = parseFloat(originalItem.quantity);
        const newQty = parseFloat(item.quantity);
        const difference = newQty - originalQty;

        if (difference > 0) {
          if (parseFloat(feedStock.stock) < difference) {
            throw new Error(`Stok tidak cukup untuk pakan dengan ID ${originalItem.feed_id}. Stok tersedia: ${feedStock.stock} kg`);
          }
        }

        const newStock = parseFloat(feedStock.stock) - difference;
        await feedStock.update(
          { stock: newStock, updated_by: options.userId },
          { transaction: t, userId: options.userId }
        );
        console.log("FeedStock updated in beforeUpdate", {
          feedId: originalItem.feed_id,
          newStock,
          userId: options.userId,
        });
      },
      beforeDestroy: async (item, options) => {
        console.log("Starting beforeDestroy hook for DailyFeedItems", {
          feedId: item.feed_id,
          quantity: item.quantity,
          userId: options.userId,
          transactionId: options.transaction?.id,
        });
        const t = options.transaction;
        if (!options.userId) {
          throw new Error("User ID is required for deleting DailyFeedItems");
        }

        const feedStock = await FeedStock.findOne({
          where: { feedId: item.feed_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!feedStock) {
          throw new Error(`Stok pakan dengan ID ${item.feed_id} tidak ditemukan`);
        }

        const newStock = parseFloat(feedStock.stock) + parseFloat(item.quantity);
        await feedStock.update(
          { stock: newStock, updated_by: options.userId },
          { transaction: t, userId: options.userId }
        );
        console.log("FeedStock updated in beforeDestroy", {
          feedId: item.feed_id,
          newStock,
          userId: options.userId,
        });
      },
    },
  }
);

module.exports = DailyFeedItems;