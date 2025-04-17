const Notification = require("../models/notificationModel");
const FeedStock = require("../models/feedStockModel");
const Feed = require("../models/feedModel");
const { Op } = require("sequelize");

// Utility function to create a feed stock notification
const createFeedStockNotification = async (
  feedStockId,
  message,
  type = "warning"
) => {
  try {
    return await Notification.create({
      feed_stock_id: feedStockId,
      message,
      type,
      date: new Date(),
    });
  } catch (error) {
    console.error("Error creating feed stock notification:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Controller methods
const notificationController = {
  // Get all notifications
  getAllNotifications: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        order: [["date", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: notifications,
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

  // Get unread notifications
  getUnreadNotifications: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: { is_read: false },
        order: [["date", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error("Error fetching unread notifications:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread notifications",
        error: error.message,
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    const { id } = req.params;

    try {
      const notification = await Notification.findByPk(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: `Notification with ID ${id} not found`,
        });
      }

      notification.is_read = true;
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      console.error("Error marking notification as read:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error: error.message,
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      await Notification.update(
        { is_read: true },
        { where: { is_read: false } }
      );

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
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
      const criticalStocks = await FeedStock.findAll({
        include: [
          {
            model: Feed,
            required: true,
            attributes: ["name", "min_stock"],
          },
        ],
        where: {
          stock: {
            [Op.lte]: sequelize.col("Feed.min_stock"),
          },
        },
      });

      if (!criticalStocks || criticalStocks.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No critical stock levels found",
          data: [],
        });
      }

      const notifications = [];

      for (const stockItem of criticalStocks) {
        const message = `Stok ${stockItem.Feed.name} tinggal ${stockItem.stock}kg, silahkan tambah stok`;

        const existingNotification = await Notification.findOne({
          where: {
            feed_stock_id: stockItem.id,
            is_read: false,
          },
        });

        if (!existingNotification) {
          const notification = await createFeedStockNotification(
            stockItem.id,
            message
          );
          notifications.push(notification);
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
        order: [["date", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: notifications,
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
