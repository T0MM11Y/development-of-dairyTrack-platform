// Impor semua model
const Feed = require("./feedModel");
const FeedType = require("./feedTypeModel");
const FeedStock = require("./feedStockModel");
const Notification = require("./notificationModel");
const DailyFeedComplete = require("./dailyFeedComplete");
const DailyFeedItems = require("./dailyFeedItemsModel");

// FeedType <--> Feed (One-to-Many)
FeedType.hasMany(Feed, { foreignKey: "typeId", as: "feeds" });
Feed.belongsTo(FeedType, { foreignKey: "typeId", as: "feedType" });

// Feed <--> FeedStock (One-to-Many)
Feed.hasMany(FeedStock, { foreignKey: "feedId", as: "feedStocks" });
FeedStock.belongsTo(Feed, { foreignKey: "feedId", as: "feed" });

// FeedStock <--> Notification (One-to-Many)
FeedStock.hasMany(Notification, { foreignKey: "feed_stock_id", as: "notifications" });
Notification.belongsTo(FeedStock, { foreignKey: "feed_stock_id", as: "feedStock" });

// DailyFeedComplete <--> DailyFeedItems (One-to-Many)
DailyFeedComplete.hasMany(DailyFeedItems, {
  foreignKey: "daily_feed_id",
  as: "feedItems",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
DailyFeedItems.belongsTo(DailyFeedComplete, {
  foreignKey: "daily_feed_id",
  as: "feedSession",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// DailyFeedItems <--> Feed (Many-to-One)
DailyFeedItems.belongsTo(Feed, {
  foreignKey: "feed_id",
  as: "feed",
});

// Debugging: Log asosiasi yang dimuat
console.log("FeedType associations:", FeedType.associations);
console.log("Feed associations:", Feed.associations);
console.log("FeedStock associations:", FeedStock.associations);
console.log("Notification associations:", Notification.associations);
console.log("DailyFeedComplete associations:", DailyFeedComplete.associations);
console.log("DailyFeedItems associations:", DailyFeedItems.associations);

module.exports = {
  Feed,
  FeedType,
  FeedStock,
  Notification,
  DailyFeedComplete,
  DailyFeedItems,
};