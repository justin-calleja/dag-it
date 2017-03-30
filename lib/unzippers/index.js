const defaults = require('./defaults')

/**
 * `unzippers` is an Object acting as a namespace for different unzippers of
 * [GNode]{@link @justinc/dag-it:GNode}.
 *
 * @namespace
 */
const unzippers = {
  /**
   * Default way of extracting each node's id
   * @function
   * @param  {DS} ds - What to extract a node's id from
   * @return {String} a string representing a node's id
   */
  id (ds) {
    return ds.id
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
    return ds.onVisit || defaults.onVisit
  }
}

module.exports = unzippers
