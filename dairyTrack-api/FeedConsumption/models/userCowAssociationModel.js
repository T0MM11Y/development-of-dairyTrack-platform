// models/userCowAssociationModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserCowAssociation = sequelize.define(
  "UserCowAssociation",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    cow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cows",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "user_cow_association",
    timestamps: false,
  }
);

module.exports = UserCowAssociation;