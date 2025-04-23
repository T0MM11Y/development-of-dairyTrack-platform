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
      allowNull: false,
      references: {
        model: "nutritions",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: { msg: "Amount must be a decimal number" },
        min: { args: [0], msg: "Amount must be at least 0" },
      },
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
    tableName: "feed_nutrisi",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["feed_id", "nutrisi_id"],
      },
    ],
  }
);

module.exports = FeedNutrisi;

