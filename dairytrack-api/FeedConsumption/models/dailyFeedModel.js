// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const DailyFeed = sequelize.define("DailyFeed", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   farmer_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   cow_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
// }, {
//   tableName: "daily_feed",
//   timestamps: true,
//   createdAt: "created_at",
//   updatedAt: "updated_at",
// });

// module.exports = DailyFeed;
