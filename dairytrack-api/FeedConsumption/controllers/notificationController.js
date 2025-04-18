const Notification = require("../models/notificationModel");
const FeedStock = require("../models/feedStockModel");
const Feed = require("../models/feedModel");
const { Op } = require("sequelize");

// Utility function to create a feed stock notification
const createFeedStockNotification = async (feedStockId, message) => {
  try {
    return await Notification.create({
      feed_stock_id: feedStockId,
      message,
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
      // Log untuk memastikan asosiasi tersedia
      console.log("Checking associations before query...");
      console.log("Notification associations:", Notification.associations);
      console.log("FeedStock associations:", FeedStock.associations);
  
      const notifications = await Notification.findAll({
        order: [["date", "DESC"]],
        include: [
          {
            model: FeedStock,
            as: "feedStock",
            required: false,
            include: [
              {
                model: Feed,
                as: "feed",
                required: false,
                attributes: ["name"],
              },
            ],
            attributes: ["stock"],
          },
        ],
      });
  
      // Map notifications to update message and add name for feed stock notifications
      const formattedNotifications = notifications.map((notification) => {
        const notificationData = notification.toJSON();
        if (
          notificationData.feed_stock_id &&
          notificationData.feedStock &&
          notificationData.feedStock.feed
        ) {
          // Konversi stock menjadi integer
          const stockAsInteger = Math.floor(parseFloat(notificationData.feedStock.stock));
          const feedName = notificationData.feedStock.feed.name;
          notificationData.message = `Sisa stok ${feedName} tinggal ${stockAsInteger}kg, silahkan tambah stok`;
          // Tambahkan properti name
          notificationData.name = `Stok Feed ${feedName}`;
        } else if (notificationData.feed_stock_id) {
          notificationData.message =
            notificationData.message || "Stok pakan tidak ditemukan, silahkan periksa";
          notificationData.name = "Stok Feed Tidak Diketahui";
        }
        delete notificationData.feedStock;
        return notificationData;
      });
  
      console.log("Formatted Notifications:", formattedNotifications); // Debugging
  
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
      const criticalStocks = await FeedStock.findAll({
        include: [
          {
            model: Feed,
            as: "feed",
            required: true,
            attributes: ["name", "min_stock"],
          },
        ],
        where: {
          stock: {
            [Op.lte]: sequelize.col("feed.min_stock"),
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
        const message = `Sisa stok ${stockItem.feed.name} tinggal ${stockItem.stock}kg, silahkan tambah stok`;

        const existingNotification = await Notification.findOne({
          where: {
            feed_stock_id: stockItem.id,
            message, // Check for identical message to avoid duplicates
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
        include: [
          {
            model: FeedStock,
            as: "feedStock",
            required: false,
            include: [
              {
                model: Feed,
                as: "feed",
                required: false,
                attributes: ["name"],
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
          notificationData.feedStock &&
          notificationData.feedStock.feed
        ) {
          // Konversi stock menjadi integer
          const stockAsInteger = Math.floor(parseFloat(notificationData.feedStock.stock));
          const feedName = notificationData.feedStock.feed.name;
          notificationData.message = `Sisa stok ${feedName} tinggal ${stockAsInteger}kg, silahkan tambah stok`;
          // Tambahkan properti name
          notificationData.name = `Stok Feed ${feedName}`;
        } else if (notificationData.feed_stock_id) {
          notificationData.message =
            notificationData.message || "Stok pakan tidak ditemukan, silahkan periksa";
          notificationData.name = "Stok Feed Tidak Diketahui";
        }
        delete notificationData.feedStock;
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