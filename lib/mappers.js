/**
 *
 * @constant
 * @type {String}
 */
const idPrefix = 'dgraph/id/'

const defaultOnVisitResult = 'dgraph/visited'

const defaultOnVisit = () => defaultOnVisitResult

/**
 * `mappers` is an Object acting as a namespace for different mappers of
 * [DS]{@link @justinc/dep-graph:DS}.
 *
 * @namespace
 */
const mappers = {
  /**
   * Default way of extracting each node's id
   * @function
   * @param  {DS} ds - What to extract a node's id from
   * @param  {Number} i - The index in the iterable at which the given DS was found
   * @return {String} a string representing a node's id
   */
  id (ds, i) {
    return ds.id || idPrefix + i
  },
  /**
   * Default way of extracting each node's dependencies.
   * @function
   * @param  {DS} ds - What to extract a node's dependencies from
   * @return {Iterable<String>} an iterable of ids
   */
  dependencies (ds) {
    return ds.dependencies || []
  },
  /**
   * Default way of extracting each node's dependents.
   * @function
   * @param  {DS} ds - What to extract a node's dependents from
   * @return {Iterable<String>} an iterable of ids
   */
  dependents (ds) {
    return ds.dependents || []
  },
  /**
   * Default way of extracting each node's OnVisit function.
   * @function
   * @param  {DS} ds - What to extract a node's OnVisit function from
   * @return {OnVisit} a (callback) function of the form OnVisit
   * @see OnVisit
   */
  onVisit (ds) {
    return ds.onVisit || defaultOnVisit
  }
}

module.exports = {
  idPrefix,
  defaultOnVisitResult,
  defaultOnVisit,
  mappers
}
