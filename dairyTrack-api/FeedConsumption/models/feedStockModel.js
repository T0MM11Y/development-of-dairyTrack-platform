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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  },
  {
    tableName: "feed_stock",
    timestamps: true,
    paranoid: true, // Aktifkan soft delete
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
        const userId = options.userId || feedStock.updated_by;
        if (!userId) {
          throw new Error("User ID is required for updating FeedStock");
        }
        feedStock.updated_by = userId;
      },
      afterCreate: async (feedStock, options) => {
        try {
          console.log("afterCreate hook triggered", {
            feedStockId: feedStock.id,
            stock: feedStock.stock,
            feedId: feedStock.feedId,
          });

          const userId = options.userId || feedStock.created_by;
          if (!userId) {
            throw new Error("User ID is required for creating FeedStockHistory");
          }

          const FeedStockHistory = sequelize.models.FeedStockHistory;
          await FeedStockHistory.create(
            {
              feedStockId: feedStock.id,
              feedId: feedStock.feedId,
              userId: userId,
              action: "CREATE",
              stock: feedStock.stock,
              previousStock: null,
              createdAt: new Date(),
            },
            { transaction: options.transaction }
          );
          console.log("Created FeedStockHistory entry", {
            feedStockId: feedStock.id,
            feedId: feedStock.feedId,
            userId: userId,
            action: "CREATE",
            stock: feedStock.stock,
            previousStock: null,
          });

          const Notification = sequelize.models.Notification;
          const Feed = sequelize.models.Feed;
          const User = sequelize.models.User;
          const feed = await Feed.findByPk(feedStock.feedId, { transaction: options.transaction });
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

            const users = await User.findAll({ attributes: ["id"], transaction: options.transaction });
            if (!users || users.length === 0) {
              console.error("No users found in the database to create notifications for");
              throw new Error("No users found in the database");
            }
            console.log("Found users for notification", { userCount: users.length, userIds: users.map(u => u.id) });

            // Cek notifikasi yang belum dibaca untuk setiap user
            const notifications = [];
            for (const user of users) {
              const existingNotification = await Notification.findOne({
                where: {
                  user_id: user.id,
                  feed_stock_id: feedStock.id,
                  type: "Sisa Pakan Menipis",
                  is_read: false,
                },
                transaction: options.transaction,
              });

              if (!existingNotification) {
                notifications.push({
                  user_id: user.id,
                  feed_stock_id: feedStock.id,
                  message,
                  created_at: new Date(),
                  type: "Sisa Pakan Menipis",
                  is_read: false,
                });
              }
            }

            if (notifications.length > 0) {
              await Notification.bulkCreate(notifications, { transaction: options.transaction, validate: true });
              console.log("Successfully created notifications for users", {
                notificationCount: notifications.length,
                message,
                userIds: notifications.map(n => n.user_id),
              });
            } else {
              console.log("No new notifications created; existing unread notifications found for all users");
            }
          }
        } catch (error) {
          console.error("Error in afterCreate hook for FeedStock:", {
            error: error.message,
            stack: error.stack,
            feedStockId: feedStock.id,
          });
          throw error;
        }
      },
      afterUpdate: async (feedStock, options) => {
        try {
          console.log("afterUpdate hook triggered", {
            feedStockId: feedStock.id,
            stock: feedStock.stock,
            feedId: feedStock.feedId,
          });

          const previousStock = feedStock._previousDataValues.stock;
          const userId = options.userId || feedStock.updated_by;
          if (!userId) {
            throw new Error("User ID is required for creating FeedStockHistory");
          }

          const FeedStockHistory = sequelize.models.FeedStockHistory;
          await FeedStockHistory.create(
            {
              feedStockId: feedStock.id,
              feedId: feedStock.feedId,
              userId: userId,
              action: "UPDATE",
              stock: feedStock.stock,
              previousStock: previousStock,
              createdAt: new Date(),
            },
            { transaction: options.transaction }
          );
          console.log("Created FeedStockHistory entry", {
            feedStockId: feedStock.id,
            feedId: feedStock.feedId,
            userId: userId,
            action: "UPDATE",
            stock: feedStock.stock,
            previousStock: previousStock,
          });

          const Notification = sequelize.models.Notification;
          const Feed = sequelize.models.Feed;
          const User = sequelize.models.User;
          const feed = await Feed.findByPk(feedStock.feedId, { transaction: options.transaction });
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

            const users = await User.findAll({ attributes: ["id"], transaction: options.transaction });
            if (!users || users.length === 0) {
              console.error("No users found in the database to create notifications for");
              throw new Error("No users found in the database");
            }
            console.log("Found users for notification", { userCount: users.length, userIds: users.map(u => u.id) });

            // Cek notifikasi yang belum dibaca untuk setiap user
            const notifications = [];
            for (const user of users) {
              const existingNotification = await Notification.findOne({
                where: {
                  user_id: user.id,
                  feed_stock_id: feedStock.id,
                  type: "Sisa Pakan Menipis",
                  is_read: false,
                },
                transaction: options.transaction,
              });

              if (!existingNotification) {
                notifications.push({
                  user_id: user.id,
                  feed_stock_id: feedStock.id,
                  message,
                  created_at: new Date(),
                  type: "Sisa Pakan Menipis",
                  is_read: false,
                });
              }
            }

            if (notifications.length > 0) {
              await Notification.bulkCreate(notifications, { transaction: options.transaction, validate: true });
              console.log("Successfully created notifications for users", {
                notificationCount: notifications.length,
                message,
                userIds: notifications.map(n => n.user_id),
              });
            } else {
              console.log("No new notifications created; existing unread notifications found for all users");
            }
          }
        } catch (error) {
          console.error("Error in afterUpdate hook for FeedStock:", {
            error: error.message,
            stack: error.stack,
            feedStockId: feedStock.id,
          });
          throw error;
        }
      },
    },
  }
);

module.exports = FeedStock;