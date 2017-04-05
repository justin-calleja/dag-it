const { readdirSync } = require('fs')
const path = require('path')

var basename = path.basename(module.filename)

/**
 * Attaches models to the given db object. The given db object is
 * expected to have a `sequelize` field with the connection to the db.
 * @param {Object} db
 */
module.exports = function addModels (db) {
  if (!db.sequelize) throw new Error('Missing connection in db.sequelize')

  const sequelize = db.sequelize

  readdirSync(path.resolve(__dirname))
    .filter(function (file) {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(function (file) {
      var model = sequelize['import'](path.join(__dirname, file))
      db[model.name] = model
    })

  Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  return db
}
