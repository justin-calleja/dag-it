const Task = require('folktale/data/task')

/**
 * @type {String}
 */
const value = 'visited'

/**
 * @return {Task}
 */
const onVisit = () => Task.of(value)

module.exports = {
  value,
  onVisit
}
