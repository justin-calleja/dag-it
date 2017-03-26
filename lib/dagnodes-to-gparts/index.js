const dagNodesToGPartsAsValidations = require('./as-validations')
const defaultMappers = require('../mappers').mappers
const { map, combineValidations } = require('../utils')
const compose = require('folktale/core/lambda/compose').all
const Result = require('folktale/data/result');

/**
 * This function is curried.
 * @param  {Mappers} [mappers=defaultMappers]
 * @param  {DAGNodes} [dagNodes=[]]
 * @return {Result<Array<Error>, GParts>}
 */
const dagNodesToGParts = (mappers = defaultMappers) => {
  return dagNodes => {
    const gPartsAsValidations = dagNodesToGPartsAsValidations(mappers)(Array.from(dagNodes))

    return compose(
      Result.fromValidation,
      // return type :: ValidationOf<GParts>
      map(() => {
        // discard  combineValidations value if successfull as the point of this
        // combination is to reduce the whole value to a Validation.Failure if there
        // was at least one Error.
        // Return the unwrapped GParts, i.e. not as Validations
        // (this value (GParts) is then itself wrapped in a Validation)
        return gPartsAsValidations.map(v => v.unsafeGet())
      }),
      combineValidations
    )(gPartsAsValidations)
  }
}

module.exports = dagNodesToGParts
