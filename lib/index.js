/**
 * This module contains helper functions to create [dependency graphs](https://en.wikipedia.org/wiki/Dependency_graph) with.
 * A dependency graph which can be traversed (no circular dependencies) forms a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph).
 * @module dgraph
*/

const mapAll = require('@justinc/map-all')
const noDups = require('@justinc/no-dups-validator')
const allIncluded = require('@justinc/all-included-validator')
const combineValidations = require('@justinc/combine-validations')
const flatten = require('lodash.flatten')
const zipWith = require('lodash.zipwith')
const compose = require('compose-function')
const Validation = require('data.validation')
const Either = require('data.either')
const toposort = require('toposort')
const mappers = require('./mappers')
const { chain, map } = require('./utils')

const { Success, Failure } = Validation
const { Left, Right } = Either

function asValidation ([isValid, errors]) {
  return isValid ? Success(true) : Failure(errors)
}

function sort (nodeNames, edges) {
  try {
    return Right(toposort.array(nodeNames, edges))
  } catch (err) {
    return Left([ err ])
  }
}

function dependencyEdges (ids, allDependencies) {
  return flatten(zipWith(ids, allDependencies, (id, ds) => ds.map(d => [d, id])))
}
function dependentEdges (ids, allDependents) {
  return flatten(zipWith(ids, allDependents, (id, ds) => ds.map(d => [id, d])))
}

function partsToEdges (ids, allDependencies, allDependents) {
  return [ ...dependencyEdges(ids, allDependencies), ...dependentEdges(ids, allDependents) ]
}

// validateParts :: Either Array<Error> [ids, allDependencies, allDependents]
function validateParts (ids, allDependencies, allDependents) {
  const noDupIds = noDups(ids)
  const allIncludedInIds = allIncluded(ids)
  const allDependenciesIncludedInIds = allIncludedInIds(flatten(allDependencies))
  const allDependentsIncludedInIds = allIncludedInIds(flatten(allDependents))
  const validation = combineValidations([
    asValidation(noDupIds('All node ids must be unique. Found the following duplicates: ')),
    asValidation(allDependenciesIncludedInIds('All dependencies must reference an existing id. Found the following invalid dependencies: ')),
    asValidation(allDependentsIncludedInIds('All dependents must reference an existing id. Found the following invalid dependents: '))
  ])
  // convert to Either so we can `chain`
  return Either.fromValidation(validation).map(() => [ids, allDependencies, allDependents])
}

// x :: Either Array<Error> sorted:Array<Number>
function x (input) {
  const [ids, allDependencies, allDependents, onVisits] = mapAll(mappers, input)

  return compose(
    map(sortedIds => {
      return {
        sortedIds,
        testing: true
      }
    }),
    chain(([ids, allDependencies, allDependents]) => sort(ids, partsToEdges(ids, allDependencies, allDependents)))
  )(validateParts(ids, allDependencies, allDependents))

  // we `chain` here since we're returing an Either (via `sort`). If we were to `map` instead we'd get nested Eithers
  // (or nested Validations had we not converted to Etiher)
  // return validateParts(ids, allDependencies, allDependents).chain(([ids, allDependencies, allDependents]) => {
  //   const dependencyEdges = flatten(zipWith(ids, allDependencies, (id, ds) => ds.map(d => [d, id])))
  //   const dependentEdges = flatten(zipWith(ids, allDependents, (id, ds) => ds.map(d => [id, d])))
  //
  //   return sort(ids, [...dependencyEdges, ...dependentEdges]).map(sortedIds => {
  //     // TODO: traverse
  //
  //     // return {
  //     //   sortedIds,
  //     //   testing: true
  //     // }
  //   })
  // })
}

module.exports = x
