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
    is_active: {
      type: DataTypes.BOOLEAN, // Maps to TINYINT(1) in MySQL
      allowNull: false,
      defaultValue: true, // Matches DEFAULT '1' in the table
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
  },
  {
    tableName: "cows",
    timestamps: true,
    underscored: true, // Ensures Sequelize uses snake_case for field names
  }
);

module.exports = Cow;