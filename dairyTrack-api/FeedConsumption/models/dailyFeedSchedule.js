// models/dailyFeedSchedule.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DailyFeedSchedule = sequelize.define(
  "DailyFeedSchedule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cows",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
      validate: {
        notNull: { msg: "Cow ID is required" },
        isInt: { msg: "Cow ID must be an integer" },
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: "Date is required" },
        isDate: { msg: "Date must be a valid date" },
      },
    },
    session: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Session cannot be empty" },
        isIn: {
          args: [["Pagi", "Siang", "Sore"]],
          msg: "Session must be one of: Pagi, Siang, Sore",
        },
      },
    },
    weather: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    total_nutrients: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "daily_feed_schedule",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["cow_id", "date", "session"],
      },
    ],
  }
);

module.exports = DailyFeedSchedule;