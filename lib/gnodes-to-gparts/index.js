const gNodesToGPartsAsValidations = require('./as-validations')
const defaultUnzippers = require('../unzippers')
const { map, combineValidations } = require('../utils')
const compose = require('folktale/core/lambda/compose').all
const Result = require('folktale/data/result')

/**
 * This function is curried.
 * @param  {Unzippers} [unzippers=defaultUnzippers]
 * @param  {Array<GNode>} [gNodes=[]]
 * @return {Result<Array<Error>, GParts>}
 */
const gNodesToGParts = (unzippers = defaultUnzippers) => {
  return gNodes => {
    try {
      const gPartsAsValidations = gNodesToGPartsAsValidations(unzippers)(Array.from(gNodes))

      return compose(
        Result.fromValidation,
        // ⬆ :: ValidationOf<GParts>
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
    } catch (err) {
      return Result.Error([ err ])
    }
  }
}

module.exports = gNodesToGParts
