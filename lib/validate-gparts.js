const Result = require('folktale/data/result')
const flatten = require('lodash.flatten')
const noDups = require('@justinc/no-dups-validator')
const allIncluded = require('@justinc/all-included-validator')
const { combineValidations, validatorResultToValidation } = require('./utils')

/**
 *
 * @param  {GParts} gParts
 * @return {Result<Array<Error>, GParts>}
 */
const validateGParts = gParts => {
  const [ids, allDependencies, allDependents] = gParts

  const noDupIds = noDups(ids)
  const allIncludedInIds = allIncluded(ids)
  const allDependenciesIncludedInIds = allIncludedInIds(flatten(allDependencies))
  const allDependentsIncludedInIds = allIncludedInIds(flatten(allDependents))
  const successOrFailure = combineValidations([
    validatorResultToValidation(
      noDupIds('All node ids must be unique. Found the following duplicates: ')
    ),
    validatorResultToValidation(
      allDependenciesIncludedInIds('All dependencies must reference an existing id. Found the following invalid dependencies: ')
    ),
    validatorResultToValidation(
      allDependentsIncludedInIds('All dependents must reference an existing id. Found the following invalid dependents: ')
    )
  ])

  return Result.fromValidation(successOrFailure).map(() => gParts)
}

module.exports = validateGParts
