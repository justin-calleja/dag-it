'use strict'

module.exports = function (sequelize, DataTypes) {
  var Item = sequelize.define('Item', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true }
  }, {
    freezeTableName: true,
    tableName: 'Items',
    timestamps: true,
    updatedAt: false
  })

  return Item
}
