const Feed = require('../models/feedModel');
const FeedStock = require('../models/feedStockModel');
const Notification = require('../models/notificationModel');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const feedStockService = {
  /**
   * Monitor feed stock levels and create notifications for items below minimum stock level
   */
  monitorFeedStockLevels: async () => {
    try {
      console.log('Checking feed stock levels...');
      
      // Get all feed stocks with their related feed info
      const feedStocks = await FeedStock.findAll({
        include: [{
          model: Feed,
          attributes: ['id', 'name', 'min_stock'],
          required: true
        }]
      });
      
      let notificationsCreated = 0;
      
      for (const stockItem of feedStocks) {
        // Check if stock is below or equal to minimum stock level
        if (parseFloat(stockItem.stock) <= parseFloat(stockItem.Feed.min_stock)) {
          // Check if an unread notification already exists for this feed stock
          const existingNotification = await Notification.findOne({
            where: {
              feed_stock_id: stockItem.id,
              is_read: false
            }
          });
          
          // If no unread notification exists, create one
          if (!existingNotification) {
            const message = `Stok ${stockItem.Feed.name} tinggal ${stockItem.stock}kg, silahkan tambah stok`;
            
            await Notification.create({
              feed_stock_id: stockItem.id,
              message,
              type: 'warning',
              date: new Date()
            });
            
            notificationsCreated++;
            console.log(`Created notification for ${stockItem.Feed.name}: ${message}`);
          }
        }
      }
      
      console.log(`Feed stock monitoring complete. Created ${notificationsCreated} new notifications.`);
      return notificationsCreated;
    } catch (error) {
      console.error('Error monitoring feed stock levels:', error);
      throw error;
    }
  }
};

module.exports = feedStockService;