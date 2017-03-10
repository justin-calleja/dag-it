/**
 * This module contains helper functions to create and traverse [dependency graphs](https://en.wikipedia.org/wiki/Dependency_graph).
 * A dependency graph which can be traversed (no circular dependencies) forms a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph).
 * @module @justinc/dgraph
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
const { mappers } = require('./mappers')
const { chain, map } = require('./utils')

const { Success, Failure } = Validation
const { Left, Right } = Either

// TODO: document that "GraphParts" (or "Parts") is: [ids, allDependencies, allDependents]

const zip = (a, b) => zipWith((x, y) => [x, y], a, b)

function asValidation ([isValid, errors]) {
  return isValid ? Success(true) : Failure(errors)
}

// Throwing an Error would not allow us to keep composing smaller functions to build bigger ones.
// If we want to keep composing, we must return a composable value, such as the `Either` monad.
function sort (nodeNames) {
  return edges => {
    try {
      return Right(toposort.array(nodeNames, edges))
    } catch (err) {
      return Left([ err ])
    }
  }
}

function dependencyEdges (ids, allDependencies) {
  return flatten(zipWith(ids, allDependencies, (id, ds) => ds.map(d => [d, id])))
}
function dependentEdges (ids, allDependents) {
  return flatten(zipWith(ids, allDependents, (id, ds) => ds.map(d => [id, d])))
}

function partsToEdges ([ids, allDependencies, allDependents]) {
  return [ ...dependencyEdges(ids, allDependencies), ...dependentEdges(ids, allDependents) ]
}

// validateParts :: Either Array<Error> [ids, allDependencies, allDependents]
function validateParts ([ids, allDependencies, allDependents]) {
  const noDupIds = noDups(ids)
  const allIncludedInIds = allIncluded(ids)
  const allDependenciesIncludedInIds = allIncludedInIds(flatten(allDependencies))
  const allDependentsIncludedInIds = allIncludedInIds(flatten(allDependents))
  const validation = combineValidations([
    asValidation(noDupIds('All node ids must be unique. Found the following duplicates: ')),
    asValidation(allDependenciesIncludedInIds('All dependencies must reference an existing id. Found the following invalid dependencies: ')),
    asValidation(allDependentsIncludedInIds('All dependents must reference an existing id. Found the following invalid dependents: '))
  ])
  // Convert to `Either` so we can `chain`. Since `sort` also returns a wrapped value, we don't want them nested. To avoid nested, we can `chain`.
  // But `Validation` is a `functor` (functors don't support chaining), so we need to convert it to an `Either` which is a `monad` and can `chain`.
  // Also, `Either` has similar semantics to `Validation` meaning that it can represent a "fail" or "success" result).
  return Either.fromValidation(validation).map(() => [ids, allDependencies, allDependents])
}

// x :: Either Array<Error> sorted:Array<Number>
// TODO: link to tutorial on how mondas / functors can be composed via `chain` and `map`
function traverser ({
  mappers: {
    id = mappers.id,
    dependencies = mappers.dependencies,
    dependents = mappers.dependents,
    onVisit = mappers.onVisit
  }
} = { mappers: {} }) {
  return input => {
    const [ids, allDependencies, allDependents] = mapAll([id, dependencies, dependents])(input)

    return compose(
      map(sortedIds => {
        const dNodeLookup = new Map(zip(ids, input))
        const env = sortedIds.reduce((acc, nextId) => {
          return acc.set(nextId, [ dNodeLookup.get(nextId) ])
        }, new Map())
        return sortedIds.reduce((acc, nextId) => {
          const x = acc.get(nextId)
          x.push(onVisit(x[0])(env, nextId))
          return acc.set(nextId, x)
        }, env)
      }),
      chain(sort(ids)),
      map(partsToEdges)
    )(validateParts([ids, allDependencies, allDependents]))
  }
}

/**
 * The default traverser.
 * @type {Traverser}
 */
const traverse = traverser({ mappers })

module.exports = {
  sort,
  partsToEdges,
  dependencyEdges,
  dependentEdges,
  validateParts,
  traverser,
  traverse
}
