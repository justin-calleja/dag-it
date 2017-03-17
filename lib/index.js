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
// const Validation = require('data.validation')
const Either = require('data.either')
const toposort = require('toposort')
const defaultMappers = require('./mappers').mappers
const { chain, map, asValidation, ensureValidationFactory } = require('./utils')

// const { Success, Failure } = Validation
const { Left, Right } = Either

// /**
//  * Either an Array of Errors or an Array of String. The strings represent the node ids.
//  * If any errors are found when mapping the ids out of the user given input, then this type will be a
//  * Left case (i.e. Array Error). If all mappings succeed, it will be a Right case (i.e. Array String)
//  * @typedef {Either<Array Error, Array String>} Ids
//  */
//
// /**
//  * Either an Array of Errors or an Array of Array of String. The array of strings represent the node ids which are
//  * dependencies of a given node.
//  * If any errors are found when mapping the dependencies out of the user given input, then this type will be a
//  * Left case (i.e. Array Error). If all mappings succeed, it will be a Right case (i.e. Array<Array String>)
//  * @typedef {Either<Array Error, Array<Array String>>} AllDependencies
//  */
//
// /**
//  * Either an Array of Errors or an Array of Array of String. The array of strings represent the node ids which are
//  * dependents of a given node.
//  * If any errors are found when mapping the dependents out of the user given input, then this type will be a
//  * Left case (i.e. Array Error). If all mappings succeed, it will be a Right case (i.e. Array<Array String>)
//  * @typedef {Either<Array Error, Array<Array String>>} AllDependents
//  */

/**
 * GraphParts is a type with all info needed to create a directed acyclic graph.
 * It's a Tuple of all node ids (at index 0), their depedencies (at index 1), and their dependents (at index 2).
 * Note that there's a correspondance at the index level, meaning that ids[0] is the id of a node, allDependencies[0],
 * are the node's dependencies, and allDependents[0] are the node's dependents - etc…
 * @typedef {Tuple< Array<String>, Array<Array<String>>, Array<Array<String>> >} GraphParts
 */

const zip = (a, b) => zipWith((x, y) => [x, y], a, b)

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

// partsToEdges :: GraphParts -> Array<Tuple<String, String>>
function partsToEdges ([ids, allDependencies, allDependents]) {
  return [ ...dependencyEdges(ids, allDependencies), ...dependentEdges(ids, allDependents) ]
}

// If given Either is Left, no further validation is performed. Otherwise, validation is performed
// on GraphParts.
//
// validateParts :: Either<Array<Error>, GraphParts> -> Either<Array<Error>, GraphParts>

// validateParts :: GraphParts -> Either<Array<Error>, GraphParts>
function validateParts (parts) {
  const [ids, allDependencies, allDependents] = parts
  const noDupIds = noDups(ids)
  const allIncludedInIds = allIncluded(ids)
  const allDependenciesIncludedInIds = allIncludedInIds(flatten(allDependencies))
  const allDependentsIncludedInIds = allIncludedInIds(flatten(allDependents))
  const validation = combineValidations([
    asValidation(noDupIds('All node ids must be unique. Found the following duplicates: ')),
    asValidation(allDependenciesIncludedInIds('All dependencies must reference an existing id. Found the following invalid dependencies: ')),
    asValidation(allDependentsIncludedInIds('All dependents must reference an existing id. Found the following invalid dependents: '))
  ])

  return Either.fromValidation(validation).map(() => parts)
}

/**
 * Used by extractPartsFactory. Defined once in module's global scope to avoid recreating each time it's needed.
 * @private
 */
function concatErrors (errs3) {
  return errs2 => errs1 => (errs1 || []).concat(errs2, errs3)
}

/**
 * Used by extractPartsFactory. Defined once in module's global scope to avoid recreating each time it's needed.
 * @private
 */
function graphPartsFactory (arr3) {
  return arr2 => arr1 => [arr1, arr2, arr3]
}

// extractPartsFactory :: (Object<VMapper, VMapper, VMapper>) -> DS -> Either<Array<Error>, GraphParts>
function extractPartsFactory ({ idMapper = defaultMappers.id, dependenciesMapper = defaultMappers.dependencies, dependentsMapper = defaultMappers.dependents } = {}) {
  return input => {
    const ensureValidation = ensureValidationFactory(x => x == null) // catches undefined too

    const [idValidations, dependencyValidations, dependentValidations] = mapAll([
      // Note: if users specify custom mappers, they will likely not be mapping the exact keys 'id', 'dependencies', and 'dependents'.
      // To get proper error reporting in that case, users must return a Validation<Array(Error), Any> from their mappers.
      compose(ensureValidation(x => `No id found in ${JSON.stringify(x)}`), idMapper),
      compose(ensureValidation(x => `No dependencies found in ${JSON.stringify(x)}`), dependenciesMapper),
      compose(ensureValidation(x => `No dependents found in ${JSON.stringify(x)}`), dependentsMapper)
    ])(input)

    // idValidation :: Validation<Array<Error>, Array<String>>
    const idValidation = combineValidations(idValidations)
    // dependencyValidation :: Validation<Array<Error>, Array<Array<String>>>
    const dependencyValidation = combineValidations(dependencyValidations)
    // dependentValidation :: Validation<Array<Error>, Array<Array<String>>>
    const dependentValidation = combineValidations(dependentValidations)

    // partsAsValidation :: Validation<Array<Error>, GraphParts>
    const partsAsValidation = idValidation.bimap(idErrs => {
      return concatErrors(dependentValidation.merge())(dependencyValidation.merge())(idErrs)
    }, ids => {
      return graphPartsFactory(dependentValidation.merge())(dependencyValidation.merge())(ids)
    })

    return Either.fromValidation(partsAsValidation)
  }
}

function ensureDependentsIncludedInDependencies ([ids, allDependencies, allDependents]) {

}

        // map(sortedIds => {
        //   const onVisit = mappers.onVisit || defaultMappers.onVisit
        //   const nodeLookup = new Map(zip(ids, input))
        //
        //   sortedIds.reduce((map, id) => {
        //     const input = nodeLookup.get(id)
        //     input.
        //     onVisit()([id, ])
        //     // map.set(id, )
        //   }, new Map())
        //
        //   // const env = sortedIds.reduce((acc, nextId) => {
        //   //   return acc.set(nextId, [ dNodeLookup.get(nextId) ])
        //   // }, new Map())
        //   // return sortedIds.reduce((acc, nextId) => {
        //   //   const x = acc.get(nextId)
        //   //   x.push(onVisit(x[0])(env, nextId))
        //   //   return acc.set(nextId, x)
        //   // }, env)
        // }),

// x :: Either Array<Error> sorted:Array<Number>
// TODO: link to tutorial on how mondas / functors can be composed via `chain` and `map`
// TODO: Change traverser to take in `extractParts` result
function traverser (mappers = defaultMappers) {
  return input => {
    const extractParts = extractPartsFactory(mappers)
    const partsAsEither = extractParts(input)

    return partsAsEither.map(([ids, allDependencies, allDependents]) => {
      const sortedIdsAsEither = compose(
        chain(sort(ids)),
        map(partsToEdges),
        validateParts
      )([ids, allDependencies, allDependents])

      return null // TODO
    })
  }

  // Either<Array<Error>, GraphParts>
  // const [ids, allDependencies, allDependents] = mapAll([id, dependencies, dependents])(input)

  // return compose(
  //   map(sortedIds => {
  //     const dNodeLookup = new Map(zip(ids, input))
  //     const env = sortedIds.reduce((acc, nextId) => {
  //       return acc.set(nextId, [ dNodeLookup.get(nextId) ])
  //     }, new Map())
  //     return sortedIds.reduce((acc, nextId) => {
  //       const x = acc.get(nextId)
  //       x.push(onVisit(x[0])(env, nextId))
  //       return acc.set(nextId, x)
  //     }, env)
  //   }),
  //   chain(sort(ids)),
  //   map(partsToEdges)
  // )(validateParts([ids, allDependencies, allDependents]))
}

// /**
//  * The default traverser.
//  * @type {Traverser}
//  */
// const traverse = traverser({ mappers })

module.exports = {
  sort,
  partsToEdges,
  dependencyEdges,
  dependentEdges,
  validateParts,
  extractPartsFactory,
  extractParts: extractPartsFactory(),
  traverser
}
