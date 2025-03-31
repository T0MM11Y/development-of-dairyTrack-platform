const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cows = sequelize.define(
  "Cows",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    farmerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "farmer_id",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "birth_date",
    },
    lactationStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "lactation_status",
    },
    lactationPhase: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "lactation_phase",
    },
    weightKg: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      field: "weight_kg",
    },
    reproductiveStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "reproductive_status",
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "entry_date",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    tableName: "cows",
    timestamps: true,
  }
);

module.exports = Cows;