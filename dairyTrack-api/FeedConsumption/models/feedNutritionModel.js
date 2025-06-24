const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeedNutrisi = sequelize.define(
  "FeedNutrisi",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "feed",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    nutrisi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "nutritions",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: { msg: "Jumlah harus berupa angka desimal" },
        min: { args: [0], msg: "Jumlah harus minimal 0" },
      },
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  },
  {
    tableName: "feed_nutrisi",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["feed_id", "nutrisi_id"],
      },
    ],
  }
);

module.exports = FeedNutrisi;