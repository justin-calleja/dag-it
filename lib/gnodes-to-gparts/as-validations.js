const unzip = require('@justinc/map-all')
const compose = require('folktale/core/lambda/compose').all
const Validation = require('folktale/data/validation')
const defaultUnzippers = require('../unzippers')
const { map, asValidation, combineValidations } = require('../utils')

const { Failure } = Validation

/**
 * A ValidationOf is a Validation with a type parameter for the success type.
 * The error type is an `Array<Error>`
 * @private
 * @typedef {Validation<Array<Error>, S>} ValidationOf
 */

 /**
  * @private
  * @typedef {Tuple<
  *   ValidationOf<Array<String>>,
  *   ValidationOf<Array<Array<String>>>,
  *   ValidationOf<Array<Array<String>>>,
  *   ValidationOf<Array<OnVisit>>
  * >} GPartsAsValidations
  */

/**
 * This function is curried.
 * @private
 * @param  {Unzippers} [unzippers=defaultUnzippers]
 * @param  {Array<GNode>} [gNodes=[]]
 * @return {GPartsAsValidations}
 */
const gNodesToGPartsAsValidations = ({ id, dependencies, dependents, onVisit } = defaultUnzippers) => {
  return (gNodes = []) => {
    return compose(
      map(combineValidations),
      // ⬆ :: [
      //    idValidations :: Array<Validation>,
      //    dependencyValidations :: Array<Validation>,
      //    dependentValidations :: Array<Validation>,
      //    onVisitValidations :: Array<Validation>
      // ]
      unzip([
        // Note: if users specify custom unzippers, they will likely not be unzipping the exact keys 'id', 'dependencies', and 'dependents'.
        // To get proper error reporting in that case, users must return a Validation<Array(Error), Any> from their unzippers.
        node => compose(
          asValidation(v => Failure([ new Error(`No id found in ${JSON.stringify(node)}`) ])),
          id
        )(node),
        node => compose(
          asValidation(v => Failure([ new Error(`No dependencies found in ${JSON.stringify(node)}`) ])),
          dependencies
        )(node),
        node => compose(
          asValidation(v => Failure([ new Error(`No dependents found in ${JSON.stringify(node)}`) ])),
          dependents
        )(node),
        node => compose(
          asValidation(v => Failure([ new Error(`No onVisit found in ${JSON.stringify(node)}`) ])),
          onVisit
        )(node)
      ])
    )(gNodes)
  }
}

module.exports = gNodesToGPartsAsValidations
