const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Feed = sequelize.define(
  "Feed",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "feed_type", // Menggunakan nama tabel
        key: "id",
      },
      onDelete: "CASCADE",
      field: "type_id",
      validate: {
        notNull: { msg: "Feed type is required" },
        isInt: { msg: "Feed type must be an integer" },
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: "Feed name must be unique",
      },
    },
    protein: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "Protein must be a decimal number" },
        min: { args: [0], msg: "Protein must be at least 0" },
      },
    },
    energy: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "Energy must be a decimal number" },
        min: { args: [0], msg: "Energy must be at least 0" },
      },
    },
    fiber: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "Fiber must be a decimal number" },
        min: { args: [0], msg: "Fiber must be at least 0" },
      },
    },
    min_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Minimum stock must be at least 0" },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: { msg: "Price must be a decimal number" },
        min: { args: [0], msg: "Price must be at least 0" },
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
    tableName: "feed",
    timestamps: true,
  }
);

module.exports = Feed;
