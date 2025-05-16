// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const Notification = sequelize.define(
//   "Notification",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     feed_stock_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     message: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     date: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     tableName: "notifications",
//     timestamps: false,
//   }
// );

// module.exports = Notification;