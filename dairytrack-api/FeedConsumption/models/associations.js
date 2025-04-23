const FeedType = require("./feedTypeModel");
const Feed = require("./feedModel");
const Nutrisi = require("./nutritionModel");
const FeedNutrisi = require("./feedNutritionModel");
const DailyFeedSchedule = require("./dailyFeedSchedule");
const DailyFeedItems = require("./dailyFeedItemsModel");
const FeedStock = require("./feedStockModel");
const Notification = require("./notificationModel");

function defineAssociations() {
  console.log("Defining associations...");

  // FeedType ↔ Feed (One-to-Many)
  FeedType.hasMany(Feed, { foreignKey: "typeId", onDelete: "CASCADE", onUpdate: "CASCADE", as: "Feeds" });
  Feed.belongsTo(FeedType, { foreignKey: "typeId", as: "FeedType" });

  // Feed ↔ Nutrisi (Many-to-Many via FeedNutrisi)
  Feed.belongsToMany(Nutrisi, {
    through: FeedNutrisi,
    foreignKey: "feed_id",
    as: "Nutrisi",
  });
  Nutrisi.belongsToMany(Feed, {
    through: FeedNutrisi,
    foreignKey: "nutrisi_id",
    as: "Feeds",
  });

  // Feed ↔ FeedNutrisi (One-to-Many)
  Feed.hasMany(FeedNutrisi, {
    foreignKey: "feed_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "FeedNutrisiRecords",
  });
  FeedNutrisi.belongsTo(Feed, { foreignKey: "feed_id", as: "Feed" });

  // Nutrisi ↔ FeedNutrisi (One-to-Many)
  Nutrisi.hasMany(FeedNutrisi, {
    foreignKey: "nutrisi_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "FeedNutrisiRecords",
  });
  FeedNutrisi.belongsTo(Nutrisi, { foreignKey: "nutrisi_id", as: "Nutrisi" });

  // DailyFeedSchedule ↔ DailyFeedItems (One-to-Many)
  DailyFeedSchedule.hasMany(DailyFeedItems, {
    foreignKey: "daily_feed_id",
    as: "DailyFeedItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DailyFeedItems.belongsTo(DailyFeedSchedule, {
    foreignKey: "daily_feed_id",
    as: "DailyFeedSchedule",
  });

  // Feed ↔ DailyFeedItems (One-to-Many)
  Feed.hasMany(DailyFeedItems, {
    foreignKey: "feed_id",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
    as: "DailyFeedItems",
  });
  DailyFeedItems.belongsTo(Feed, { foreignKey: "feed_id", as: "Feed" });

  // Feed ↔ FeedStock (One-to-One)
  Feed.hasOne(FeedStock, {
    foreignKey: "feedId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "FeedStock",
  });
  FeedStock.belongsTo(Feed, { foreignKey: "feedId", as: "Feed" });

  // FeedStock ↔ Notification (One-to-Many)
  FeedStock.hasMany(Notification, {
    foreignKey: "feed_stock_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "Notifications",
  });
  Notification.belongsTo(FeedStock, { foreignKey: "feed_stock_id", as: "FeedStock" });

  console.log("Associations defined successfully");
}

module.exports = defineAssociations;