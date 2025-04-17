// Impor semua model
const Feed = require("./feedModel");
const FeedType = require("./feedTypeModel");
const FeedStock = require("./feedStockModel");
const Notification = require("./notificationModel");

// FeedType <--> Feed (One-to-Many)
FeedType.hasMany(Feed, { foreignKey: "typeId", as: "feeds" });
Feed.belongsTo(FeedType, { foreignKey: "typeId", as: "feedType" });

// Feed <--> FeedStock (One-to-Many)
Feed.hasMany(FeedStock, { foreignKey: "feedId", as: "feedStocks" });
FeedStock.belongsTo(Feed, { foreignKey: "feedId", as: "feed" });

// FeedStock <--> Notification (One-to-Many)
FeedStock.hasMany(Notification, { foreignKey: "feed_stock_id", as: "notifications" });
Notification.belongsTo(FeedStock, { foreignKey: "feed_stock_id", as: "feedStock" });

// Debugging: Log asosiasi yang dimuat
console.log("FeedType associations:", FeedType.associations);
console.log("Feed associations:", Feed.associations);
console.log("FeedStock associations:", FeedStock.associations);
console.log("Notification associations:", Notification.associations);

module.exports = {
  Feed,
  FeedType,
  FeedStock,
  Notification,
};