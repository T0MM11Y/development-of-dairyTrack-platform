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
      validate: {
        notEmpty: { msg: "Feed name cannot be empty" }
      }
    },
    protein: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        // Gunakan validator kustom untuk protein untuk mengizinkan nilai 0
        isValidProtein(value) {
          // Jika nilai ada dan bisa dikonversi ke angka
          if (value === null || value === undefined) {
            throw new Error('Protein value is required');
          }
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            throw new Error('Protein must be a number');
          }
          if (numValue < 0) {
            throw new Error('Protein cannot be negative');
          }
        }
      },
    },
    energy: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        // Gunakan validator kustom untuk energi untuk mengizinkan nilai 0
        isValidEnergy(value) {
          if (value === null || value === undefined) {
            throw new Error('Energy value is required');
          }
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            throw new Error('Energy must be a number');
          }
          if (numValue < 0) {
            throw new Error('Energy cannot be negative');
          }
        }
      },
    },
    fiber: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        // Gunakan validator kustom untuk serat untuk mengizinkan nilai 0
        isValidFiber(value) {
          if (value === null || value === undefined) {
            throw new Error('Fiber value is required');
          }
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            throw new Error('Fiber must be a number');
          }
          if (numValue < 0) {
            throw new Error('Fiber cannot be negative');
          }
        }
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