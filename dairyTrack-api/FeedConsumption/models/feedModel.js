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
      allowNull: true,
      references: {
        model: "feed_type",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
      field: "type_id",
      validate: {
        isInt: { msg: "Tipe pakan harus berupa angka" },
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: "Nama pakan harus unik",
      },
      validate: {
        notEmpty: { msg: "Nama pakan tidak boleh kosong" },
      },
    },
    min_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Stok minimum harus berupa angka" },
        min: { args: [0], msg: "Stok minimum harus minimal 0" },
      },
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Unit tidak boleh kosong" },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: { msg: "Harga harus berupa angka desimal" },
        min: { args: [0], msg: "Harga harus minimal 0" },
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
    tableName: "feed",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Feed;