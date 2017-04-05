'use strict'

module.exports = function (sequelize, DataTypes) {
  var ItemInstance = sequelize.define('ItemInstance', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    version: { type: DataTypes.INTEGER, allowNull: false, unique: 'itemId_version_index' },
    value: DataTypes.TEXT
  }, {
    freezeTableName: true,
    tableName: 'ItemInstances',
    timestamps: true,
    updatedAt: false,
    classMethods: {
      associate (models) {
        ItemInstance.belongsTo(models.Item, {
          foreignKey: {
            name: 'itemId',
            allowNull: false,
            unique: 'itemId_version_index'
          },
          foreignKeyConstraint: true,
          onDelete: 'CASCADE'
        })
      }
    }
  })

  return ItemInstance
}
