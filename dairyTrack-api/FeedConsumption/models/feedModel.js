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
        model: "feed_type",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
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
      validate: {
        notEmpty: { msg: "Feed name cannot be empty" },
      },
    },
    min_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Minimum stock must be an integer" },
        min: { args: [0], msg: "Minimum stock must be at least 0" },
      },
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Unit cannot be empty" },
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
    tableName: "feed",
    timestamps: true,
  }
);

module.exports = Feed;