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
      allowNull: true,
      references: {
        model: "cows",
        key: "id",
      },
      onDelete: "RESTRICT", // Changed to RESTRICT to prevent cow_id changes
      onUpdate: "CASCADE",
      validate: {
        isInt: { msg: "ID sapi harus berupa angka" },
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: "Tanggal harus diisi" },
        isDate: { msg: "Tanggal harus valid" },
      },
    },
    session: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Sesi tidak boleh kosong" },
        isIn: {
          args: [["Pagi", "Siang", "Sore"]],
          msg: "Sesi harus salah satu dari: Pagi, Siang, Sore",
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
      defaultValue: [], // Consistent with controller
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "daily_feed_schedule",
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["cow_id", "date", "session"],
      },
    ],
  }
);

module.exports = DailyFeedSchedule;