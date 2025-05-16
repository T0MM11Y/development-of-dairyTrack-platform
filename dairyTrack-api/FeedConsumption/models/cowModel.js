// models/cowModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cow = sequelize.define(
  "Cow",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Cow name cannot be empty" },
      },
    },
    birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "Birth date must be a valid date" },
        notNull: { msg: "Birth date is required" },
      },
    },
    breed: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Breed cannot be empty" },
      },
    },
    lactation_phase: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: "Weight must be non-negative" },
      },
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Gender cannot be empty" },
        isIn: {
          args: [["Male", "Female"]],
          msg: "Gender must be Male or Female",
        },
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
    tableName: "cows",
    timestamps: true,
  }
);

module.exports = Cow;