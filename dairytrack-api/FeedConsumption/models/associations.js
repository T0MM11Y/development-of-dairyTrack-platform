const Feed = require("./feedModel");
const FeedType = require("./feedTypeModel");
const FeedStock = require("./feedStockModel");

// FeedType <--> Feed (One-to-Many)
FeedType.hasMany(Feed, { foreignKey: "typeId", as: "feeds" });
Feed.belongsTo(FeedType, { foreignKey: "typeId", as: "feedType" });

// Feed <--> FeedStock (One-to-One)
Feed.hasOne(FeedStock, { foreignKey: "feedId", as: "feedStock" });
FeedStock.belongsTo(Feed, { foreignKey: "feedId", as: "feed" });
