const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Nutrisi = sequelize.define(
  "Nutrisi",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Nutrient name cannot be empty" },
      },
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "gram",
      validate: {
        notEmpty: { msg: "Unit cannot be empty" },
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
    tableName: "nutritions",
    timestamps: true,
  }
);

module.exports = Nutrisi;