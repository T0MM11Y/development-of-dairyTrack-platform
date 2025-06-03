const FeedType = require("./feedTypeModel");
const Feed = require("./feedModel");
const Nutrisi = require("./nutritionModel");
const FeedNutrisi = require("./feedNutritionModel");
const DailyFeedSchedule = require("./dailyFeedSchedule");
const DailyFeedItems = require("./dailyFeedItemsModel");
const FeedStock = require("./feedStockModel");
const FeedStockHistory = require("./feedStockHistoryModel");
const Notification = require("./notificationModel");
const User = require("./userModel");
const Cow = require("./cowModel");
const UserCowAssociation = require("./userCowAssociationModel");

function defineAssociations() {
  console.log("Defining associations...");

  // FeedType ↔ Feed (One-to-Many)
  FeedType.hasMany(Feed, { foreignKey: "typeId", onDelete: "CASCADE", onUpdate: "CASCADE", as: "Feeds" });
  Feed.belongsTo(FeedType, { foreignKey: "typeId", as: "FeedType" });

  // Feed ↔ Nutrisi (Many-to-Many via FeedNutrisi)
  Feed.belongsToMany(Nutrisi, { through: FeedNutrisi, foreignKey: "feed_id", as: "Nutrisi" });
  Nutrisi.belongsToMany(Feed, { through: FeedNutrisi, foreignKey: "nutrisi_id", as: "Feeds" });

  // Feed ↔ FeedNutrisi (One-to-Many)
  Feed.hasMany(FeedNutrisi, { foreignKey: "feed_id", onDelete: "CASCADE", onUpdate: "CASCADE", as: "FeedNutrisiRecords" });
  FeedNutrisi.belongsTo(Feed, { foreignKey: "feed_id", as: "Feed" });

  // Nutrisi ↔ FeedNutrisi (One-to-Many)
  Nutrisi.hasMany(FeedNutrisi, { foreignKey: "nutrisi_id", onDelete: "CASCADE", onUpdate: "CASCADE", as: "FeedNutrisiRecords" });
  FeedNutrisi.belongsTo(Nutrisi, { foreignKey: "nutrisi_id", as: "Nutrisi" });

  // DailyFeedSchedule ↔ DailyFeedItems (One-to-Many)
  DailyFeedSchedule.hasMany(DailyFeedItems, { foreignKey: "daily_feed_id", as: "DailyFeedItems", onDelete: "CASCADE", onUpdate: "CASCADE" });
  DailyFeedItems.belongsTo(DailyFeedSchedule, { foreignKey: "daily_feed_id", as: "DailyFeedSchedule" });

  // Feed ↔ DailyFeedItems (One-to-Many)
  Feed.hasMany(DailyFeedItems, { foreignKey: "feed_id", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "DailyFeedItems" });
  DailyFeedItems.belongsTo(Feed, { foreignKey: "feed_id", as: "Feed" });

  // Feed ↔ FeedStock (One-to-One)
  Feed.hasOne(FeedStock, { foreignKey: "feedId", onDelete: "CASCADE", onUpdate: "CASCADE", as: "FeedStock" });
  FeedStock.belongsTo(Feed, { foreignKey: "feedId", as: "Feed" });

  // FeedStock ↔ FeedStockHistory (One-to-Many)
  FeedStock.hasMany(FeedStockHistory, { foreignKey: "feedStockId", onDelete: "CASCADE", onUpdate: "CASCADE", as: "FeedStockHistory" });
  FeedStockHistory.belongsTo(FeedStock, { foreignKey: "feedStockId", as: "FeedStock" });

  // FeedStockHistory ↔ Feed (Many-to-One)
  FeedStockHistory.belongsTo(Feed, { foreignKey: "feedId", as: "Feed" });

  // FeedStockHistory ↔ User (Many-to-One)
  FeedStockHistory.belongsTo(User, { foreignKey: "userId", as: "User" });

  // FeedStock ↔ Notification (One-to-Many)
  FeedStock.hasMany(Notification, { foreignKey: "feed_stock_id", onDelete: "CASCADE", onUpdate: "CASCADE", as: "Notifications" });
  Notification.belongsTo(FeedStock, { foreignKey: "feed_stock_id", as: "FeedStock" });

  Notification.belongsTo(User, { foreignKey: "user_id", as: "User" });
  User.hasMany(Notification, { foreignKey: "user_id", as: "Notifications" });

  // User ↔ Cow (Many-to-Many via UserCowAssociation)
  User.belongsToMany(Cow, { through: UserCowAssociation, foreignKey: "user_id", as: "managed_cows" });
  Cow.belongsToMany(User, { through: UserCowAssociation, foreignKey: "cow_id", as: "managers" });

  // DailyFeedSchedule ↔ Cow (Many-to-One)
  DailyFeedSchedule.belongsTo(Cow, { foreignKey: "cow_id", as: "Cow" });
  Cow.hasMany(DailyFeedSchedule, { foreignKey: "cow_id", as: "DailyFeedSchedules" });

  // User Associations
  FeedType.belongsTo(User, { foreignKey: "user_id", as: "User" });
  FeedType.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  FeedType.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(FeedType, { foreignKey: "user_id", as: "FeedTypes" });

  Feed.belongsTo(User, { foreignKey: "user_id", as: "User" });
  Feed.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  Feed.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(Feed, { foreignKey: "user_id", as: "Feeds" });

  Nutrisi.belongsTo(User, { foreignKey: "user_id", as: "User" });
  Nutrisi.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  Nutrisi.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(Nutrisi, { foreignKey: "user_id", as: "Nutrisi" });

  FeedNutrisi.belongsTo(User, { foreignKey: "user_id", as: "User" });
  FeedNutrisi.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  FeedNutrisi.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(FeedNutrisi, { foreignKey: "user_id", as: "FeedNutrisiRecords" });

  DailyFeedSchedule.belongsTo(User, { foreignKey: "user_id", as: "User" });
  DailyFeedSchedule.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  DailyFeedSchedule.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(DailyFeedSchedule, { foreignKey: "user_id", as: "DailyFeedSchedules" });

  DailyFeedItems.belongsTo(User, { foreignKey: "user_id", as: "User" });
  DailyFeedItems.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  DailyFeedItems.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(DailyFeedItems, { foreignKey: "user_id", as: "DailyFeedItems" });

  FeedStock.belongsTo(User, { foreignKey: "user_id", as: "User" });
  FeedStock.belongsTo(User, { foreignKey: "created_by", as: "Creator" });
  FeedStock.belongsTo(User, { foreignKey: "updated_by", as: "Updater" });
  User.hasMany(FeedStock, { foreignKey: "user_id", as: "FeedStocks" });

  console.log("Associations defined successfully");
}

module.exports = defineAssociations;