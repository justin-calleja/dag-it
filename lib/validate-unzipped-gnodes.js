const mapAll = require('@justinc/map-all')
const Result = require('folktale/data/result')
const flatten = require('lodash.flatten')
const noDups = require('@justinc/no-dups-validator')
const allIncluded = require('@justinc/all-included-validator')
const { combineValidations, validatorResultToValidation } = require('./utils')

/**
 *
 * @param  {Array<UnzippedGNode>} unzippedGNodes
 * @return {ResultOf<Array<UnzippedGNode>>}
 */
const validateUnzippedGNodes = unzippedGNodes => {
  const [ids, allDependencies, allDependents] = mapAll([
    unzippedGNode => unzippedGNode[0],
    unzippedGNode => unzippedGNode[1],
    unzippedGNode => unzippedGNode[2]
  ])(unzippedGNodes)

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

  return Result.fromValidation(successOrFailure).map(() => unzippedGNodes)
}

module.exports = validateUnzippedGNodes
