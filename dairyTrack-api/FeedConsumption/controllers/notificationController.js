const Notification = require("../models/notificationModel");
const FeedStock = require("../models/feedStockModel");
const Feed = require("../models/feedModel");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Utility function to create a feed stock notification
const createFeedStockNotification = async (feedStockId, message) => {
  try {
    console.log("Creating notification", { feedStockId, message });
    const notification = await Notification.create({
      feed_stock_id: feedStockId,
      message,
      created_at: new Date(),
      user_id: 0,
      cow_id: 0,
      type: "Sisa Pakan Menipis",
      is_read: false,
    });
    console.log("Notification created", { notificationId: notification.id });
    return notification;
  } catch (error) {
    console.error("Error creating feed stock notification:", {
      error: error.message,
      stack: error.stack,
      feedStockId,
    });
    throw error;
  }
};

// Controller methods
const notificationController = {
  // Get all notifications
  getAllNotifications: async (req, res) => {
    try {
      console.log("Fetching all notifications...");
      console.log("Notification associations:", Notification.associations);
      console.log("FeedStock associations:", FeedStock.associations);

      const notifications = await Notification.findAll({
        order: [["created_at", "DESC"]],
        include: [
          {
            model: FeedStock,
            as: "FeedStock",
            required: false,
            include: [
              {
                model: Feed,
                as: "Feed",
                required: false,
                attributes: ["name", "unit"],
              },
            ],
            attributes: ["stock"],
          },
        ],
      });

      const formattedNotifications = notifications.map((notification) => {
        const notificationData = notification.toJSON();
        if (
          notificationData.feed_stock_id &&
          notificationData.FeedStock &&
          notificationData.FeedStock.Feed
        ) {
          const stockAsInteger = Math.floor(
            parseFloat(notificationData.FeedStock.stock)
          );
          const feedName = notificationData.FeedStock.Feed.name;
          const feedUnit = notificationData.FeedStock.Feed.unit;
          notificationData.message = `Pakan ${feedName} sisa ${stockAsInteger} ${feedUnit}, segera tambah pakan!!`;
          notificationData.name = `Stok Feed ${feedName}`;
        } else if (notificationData.feed_stock_id) {
          notificationData.message =
            notificationData.message ||
            "Stok pakan tidak ditemukan, silahkan periksa";
          notificationData.name = "Stok Feed Tidak Diketahui";
        }
        delete notificationData.FeedStock;
        return notificationData;
      });

      console.log("Formatted Notifications:", formattedNotifications.length);

      return res.status(200).json({
        success: true,
        data: formattedNotifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    const { id } = req.params;

    try {
      const notification = await Notification.findByPk(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: `Notification with ID ${id} not found`,
        });
      }

      await notification.destroy();

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting notification:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  },

  // Check feed stock levels and create notifications if needed
  checkFeedStockLevels: async (req, res) => {
    try {
      console.log("Checking feed stock levels...");
      const criticalStocks = await FeedStock.findAll({
        include: [
          {
            model: Feed,
            as: "Feed",
            required: true,
            attributes: ["name", "min_stock", "unit"],
          },
        ],
        where: {
          stock: {
            [Op.lte]: sequelize.literal("`Feed`.`min_stock`"),
          },
        },
      });

      console.log("Critical stocks found:", criticalStocks.length);

      if (!criticalStocks || criticalStocks.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No critical stock levels found",
          data: [],
        });
      }

      const notifications = [];

      for (const stockItem of criticalStocks) {
        const stockAsInteger = Math.floor(parseFloat(stockItem.stock));
        const message = `Pakan ${stockItem.Feed.name} sisa ${stockAsInteger} ${stockItem.Feed.unit}, segera tambah pakan!!`;
        console.log("Checking for existing notification", {
          feedStockId: stockItem.id,
          message,
        });

        const recentNotification = await Notification.findOne({
          where: {
            feed_stock_id: stockItem.id,
            created_at: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        if (!recentNotification) {
          const notification = await createFeedStockNotification(
            stockItem.id,
            message
          );
          notifications.push(notification);
          console.log("New notification created", {
            notificationId: notification.id,
          });
        } else {
          console.log("Recent notification exists, skipping", {
            notificationId: recentNotification.id,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Created ${notifications.length} new notifications for critical feed stock levels`,
        data: notifications,
      });
    } catch (error) {
      console.error("Error checking feed stock levels:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to check feed stock levels",
        error: error.message,
      });
    }
  },

  // Get feed stock notifications
  getFeedStockNotifications: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: {
          feed_stock_id: {
            [Op.ne]: null,
          },
        },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: FeedStock,
            as: "FeedStock",
            required: false,
            include: [
              {
                model: Feed,
                as: "Feed",
                required: false,
                attributes: ["name", "unit"],
              },
            ],
            attributes: ["stock"],
          },
        ],
      });

      const formattedNotifications = notifications.map((notification) => {
        const notificationData = notification.toJSON();
        if (
          notificationData.feed_stock_id &&
          notificationData.FeedStock &&
          notificationData.FeedStock.Feed
        ) {
          const stockAsInteger = Math.floor(
            parseFloat(notificationData.FeedStock.stock)
          );
          const feedName = notificationData.FeedStock.Feed.name;
          const feedUnit = notificationData.FeedStock.Feed.unit;
          notificationData.message = `Pakan ${feedName} sisa ${stockAsInteger} ${feedUnit}, segera tambah pakan!!`;
          notificationData.name = `Stok Feed ${feedName}`;
        } else if (notificationData.feed_stock_id) {
          notificationData.message =
            notificationData.message ||
            "Stok pakan tidak ditemukan, silahkan periksa";
          notificationData.name = "Stok Feed Tidak Diketahui";
        }
        delete notificationData.FeedStock;
        return notificationData;
      });

      return res.status(200).json({
        success: true,
        data: formattedNotifications,
      });
    } catch (error) {
      console.error("Error fetching feed stock notifications:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch feed stock notifications",
        error: error.message,
      });
    }
  },
};

module.exports = notificationController;