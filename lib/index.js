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
const Either = require('data.either')
const Maybe = require('data.maybe')
const graphlib = require('graphlib')
const defaultMappers = require('./mappers').mappers
const {
  chain,
  map,
  ap,
  validatorResultToValidation,
  asValidation
} = require('./utils')
// const Validation = require('data.validation')
const Validation = require('folktale/data/validation')

const { Success, Failure } = Validation
const { Left, Right } = Either
const { Just, Nothing } = Maybe

// function asValidation ([isValid, errors]) {
//   return isValid ? Success(true) : Failure(errors)
// }
// isFailureLike: v => v == null
// isFailureLike: ([isValid]) => !isValid
  // toFailure: Failure,
  // toSuccess: Success
/**
 * @private
 */
const identity = x => x

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
 * @typedef {Tuple< Array<String>, Array<Array<String>>, Array<Array<String>>, Array<OnVisit> >} GraphParts
 */

// const zip = (a, b) => zipWith((x, y) => [x, y], a, b)

// // Throwing an Error would not allow us to keep composing smaller functions to build bigger ones.
// // If we want to keep composing, we must return a composable value, such as the `Either` monad.
// function sort (nodeNames) {
//   return edges => {
//     try {
//       return Right(toposort.array(nodeNames, edges))
//     } catch (err) {
//       return Left([ err ])
//     }
//   }
// }

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

// validateParts :: GraphParts -> Either<Array<Error>, GraphParts>
function validateParts (parts) {
  const [ids, allDependencies, allDependents] = parts
  const noDupIds = noDups(ids)
  const allIncludedInIds = allIncluded(ids)
  const allDependenciesIncludedInIds = allIncludedInIds(flatten(allDependencies))
  const allDependentsIncludedInIds = allIncludedInIds(flatten(allDependents))
  const validation = combineValidations([
    validatorResultToValidation(noDupIds('All node ids must be unique. Found the following duplicates: ')),
    validatorResultToValidation(allDependenciesIncludedInIds('All dependencies must reference an existing id. Found the following invalid dependencies: ')),
    validatorResultToValidation(allDependentsIncludedInIds('All dependents must reference an existing id. Found the following invalid dependents: '))
  ])

  return Either.fromValidation(validation).map(() => parts)
}

// TODO: rename to `unzipObjs`
// extractParts :: (Object<VMapper, VMapper, VMapper>) -> Array<Node> -> Either<Array<Error>, GraphParts>
// function extractParts ({ idMapper = defaultMappers.id, dependenciesMapper = defaultMappers.dependencies, dependentsMapper = defaultMappers.dependents } = {}) {
function extractParts ({ id, dependencies, dependents, onVisit } = defaultMappers) {
  return input => {
    // TODO: consider try/catch around the whole body to cover cases you haven't thought about.
    // Note that mappers may be user defined (and input is always user defined) i.e. errors could be thrown there.

    compose(
      map(combineValidations),
      mapAll([

      ])
    )(input)

    // each destructured value is an Array<Validation>
    // const [idValidations, dependencyValidations, dependentValidations, onVisitValidations] = mapAll([
    const x = mapAll([
      // Note: if users specify custom mappers, they will likely not be mapping the exact keys 'id', 'dependencies', and 'dependents'.
      // To get proper error reporting in that case, users must return a Validation<Array(Error), Any> from their mappers.
      compose(
        asValidation(v => Failure([ new Error(`No id found in ${JSON.stringify(v)}`) ])),
        id
      ),
      compose(
        asValidation(v => Failure([ new Error(`No dependencies found in ${JSON.stringify(v)}`) ])),
        dependencies
      ),
      compose(
        asValidation(v => Failure([ new Error(`No dependents found in ${JSON.stringify(v)}`) ])),
        dependents
      ),
      compose(
        asValidation(v => Failure([ new Error(`No onVisit found in ${JSON.stringify(v)}`) ])),
        onVisit
      )
    ])(input)

    const partsAsValidation = combineValidations(x.map(combineValidations)).map(() => {
      return x.map(validation => validation.get())
    })

    // // idValidation :: Validation<Array<Error>, Array<String>>
    // const idValidation = combineValidations(idValidations)
    // // dependencyValidation :: Validation<Array<Error>, Array<Array<String>>>
    // const dependencyValidation = combineValidations(dependencyValidations)
    // // dependentValidation :: Validation<Array<Error>, Array<Array<String>>>
    // const dependentValidation = combineValidations(dependentValidations)
    // // onVisitValidation :: Validation<Array<Error>, Array<OnVisit>>
    // const onVisitValidation = combineValidations(onVisitValidations)
    //
    // // partsAsValidation :: Validation<Array<Error>, GraphParts>
    // const partsAsValidation = combineValidations([ idValidation, dependencyValidation, dependentValidation, onVisitValidation ]).map(() => ([
    //   idValidation.get(), dependencyValidation.get(), dependentValidation.get(), onVisitValidation.get()
    // ]))

    return Either.fromValidation(partsAsValidation)
  }
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
        // -----------------------
    // const edgesAsEither = partsAsEither.map(compose(map(toEdges), validateParts))
    // const graphAsEither = Right(graph).ap(partsAsEither).ap(edgesAsEither).chain(identity)

// TODO: finish type def
// traverse :: Graph -> Either<Array<Error>, >
function resultGraph (graph) {
  try {
    // TODO: clone the graph
    const g = graph

    const sortedIds = graphlib.alg.topsort(g)

    sortedIds.map(id => {
      const result = visitNode(g)(id)
      g.node(id)
      g.setNode

      // graph.successors(id).reduce((toVisitArg, sid) => {
      //   const node = graph.node(sid)
      // }, {})
    })

    // sortedIds.reduce((g, id) => {
    //   g.successors(id)
    //
    //   return g
    // }, graph)

    return Right(x)
  } catch (err) {
    return Left([ err ])
  }
  // return compose(
  //
  //   graphlib.alg.topsort
  // )(graph)
}

// successors :: Graph -> String -> Maybe Array<String>
function successors (graph) {
  return function successorsOf (id) {
    const ss = graph.successors(id)
    return ss ? Just(ss) : Nothing()
  }
}

// node :: Graph -> String -> Maybe Node
function node (graph) {
  return function nodeById (id) {
    const n = graph.node(id)
    return n ? Just(n) : Nothing()
  }
}

// results :: Graph -> Array<String> -> Results
function results (graph) {
  return function resultsOf (ids) {
    return ids.reduce((acc, id) => {
      acc[id] = (graph.node(id) || {}).result
      return acc
    }, {})
  }
}

// 'successor' = 'dependency' or 'dependent' of a node
// successorResults :: Graph -> String -> Maybe Object<String, Result>
function successorResults (graph) {
  return function successorResultsOf (id) {
    const resultsOf = chain(results(graph))
    const successorsAsMaybe = successors(graph)(id)

    return resultsOf(successorsAsMaybe)
  }
}

// visitNode :: Graph -> String -> Result
function visitNode (graph) {
  return function visitNodeById (id) {
    const nodeAsMaybe = node(graph)(id)
    const successorResultsAsMaybe = successorResults(graph)(id)
    const resultAsMaybe = nodeAsMaybe
      .map(node => node.onVisit)
      .ap(successorResultsAsMaybe)
    return resultAsMaybe.getOrElse(null)
    // return graph.node(id).onVisit(successorResults(graph)(id))
  }
}

// go from ids -> Array<X> s.t. X now also has 'result'

/**
 * This is the type returned by an `onVisit` function. The actual type is up to you.
 * @typedef {*} Result
 */

/**
 * @typedef {Object} Node
 * @prop id {String}
 * @prop dependencies {Array<String>}
 * @prop dependents {Array<String>}
 * @prop onVisit {OnVisit}
 * @prop result {Result}
 */

// const traverseDAG = compose(
//   graphlib.alg.topsort
// )
      // chain(identity),
      // ap(Right(toGraph).ap(partsAsEither)),

// TODO: consider giving daggit only 'parts' (which you can get from extractParts)
// TODO: link to tutorial on how mondas / functors can be composed via `chain` and `map`
// input :: Array<Node>
function dagIt (mappers = defaultMappers) {
  return input => {
    const partsAsEither = extractParts(mappers)(input)
    // const graphAsEither = compose(
    //   map(partsToGraph),
    //   chain(validateParts)
    // )(partsAsEither)

    partsAsEither.chain(validateParts)

      //  // sortedIds :: Array<String>
      //  map(graphlib.alg.topsort),
  }
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
  //   map(toEdges)
  // )(validateParts([ids, allDependencies, allDependents]))

// partsToGraph :: Parts -> Either<Array<Error>, Graph>
function partsToGraph (parts) {
  try {
    const edges = partsToEdges(parts)
    const [ids, allDependencies, allDependents, onVisits] = parts
    const g = new graphlib.Graph()
    ids.reduce((g, id, i) => g.setNode(id, {
      id,
      dependencies: allDependencies[i],
      dependents: allDependents[i],
      onVisit: onVisits[i]
    }), g)
    edges.reduce((g, [from, to]) => g.setEdge(from, to), g)
    return Right(g)
  } catch (err) {
    return Left([ err ])
  }
}

// /**
//  * The default traverser.
//  * @type {Traverser}
//  */
// const traverse = traverser({ mappers })

module.exports = {
  dependencyEdges,
  dependentEdges,
  validateParts,
  extractParts,
  defaultExtractParts: extractParts()
}
