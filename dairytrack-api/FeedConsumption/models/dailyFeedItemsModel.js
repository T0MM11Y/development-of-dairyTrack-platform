const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FeedStock = require("./feedStockModel");
const { calculateTotalNutrients } = require("./calculateNutrient");

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
        min: { args: [0], msg: "Quantity must be at least 0" },
        async checkStock(value) {
          const feedStock = await FeedStock.findOne({
            where: { feedId: this.feed_id },
          });
          if (feedStock && parseFloat(value) > parseFloat(feedStock.stock)) {
            throw new Error(
              `Quantity exceeds available stock for feed ${this.feed_id}`
            );
          }
        },
      },
    },
  },
  {
    tableName: "daily_feed_items",
    timestamps: false,
    hooks: {
      // Before creating a new feed item, validate and update stock
      beforeCreate: async (item, options) => {
        const t = options.transaction;

        // Get the current feed stock
        const feedStock = await FeedStock.findOne({
          where: { feedId: item.feed_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!feedStock) {
          throw new Error(`Stock record not found for feed ${item.feed_id}`);
        }

        // Check if enough stock
        if (parseFloat(feedStock.stock) < parseFloat(item.quantity)) {
          throw new Error(
            `Not enough stock available for feed ${item.feed_id}`
          );
        }

        // Update stock by subtracting the quantity
        const newStock =
          parseFloat(feedStock.stock) - parseFloat(item.quantity);
        await feedStock.update({ stock: newStock }, { transaction: t });
      },

      // Before updating a feed item, adjust the stock
      beforeUpdate: async (item, options) => {
        const t = options.transaction;

        // Get the original item to calculate difference
        const originalItem = await DailyFeedItems.findByPk(item.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!originalItem) {
          throw new Error(`Original feed item not found for ID ${item.id}`);
        }

        // Get the feed stock
        const feedStock = await FeedStock.findOne({
          where: { feedId: item.feed_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!feedStock) {
          throw new Error(`Stock record not found for feed ${item.feed_id}`);
        }

        // Calculate quantity difference
        const originalQty = parseFloat(originalItem.quantity);
        const newQty = parseFloat(item.quantity);
        const difference = originalQty - newQty;

        // If new quantity is higher, check if enough stock
        if (difference < 0) {
          const additionalNeeded = Math.abs(difference);
          if (parseFloat(feedStock.stock) < additionalNeeded) {
            throw new Error(
              `Not enough stock available for feed ${item.feed_id}`
            );
          }
        }

        // Update stock (add if decreasing quantity, subtract if increasing)
        const newStock = parseFloat(feedStock.stock) + difference;
        await feedStock.update({ stock: newStock }, { transaction: t });
      },

      // Before deleting a feed item, return quantity to stock
      beforeDestroy: async (item, options) => {
        const t = options.transaction;

        // Get the feed stock
        const feedStock = await FeedStock.findOne({
          where: { feedId: item.feed_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!feedStock) {
          throw new Error(`Stock record not found for feed ${item.feed_id}`);
        }

        // Update stock by adding back the quantity
        const newStock =
          parseFloat(feedStock.stock) + parseFloat(item.quantity);
        await feedStock.update({ stock: newStock }, { transaction: t });
      },
    },
  }
);

// Keep your existing hooks for calculating nutrients
DailyFeedItems.addHook("afterCreate", async (item, options) => {
  await calculateTotalNutrients(item.daily_feed_id);
});

DailyFeedItems.addHook("afterUpdate", async (item, options) => {
  await calculateTotalNutrients(item.daily_feed_id);
});

DailyFeedItems.addHook("afterDestroy", async (item, options) => {
  await calculateTotalNutrients(item.daily_feed_id);
});

module.exports = DailyFeedItems;
