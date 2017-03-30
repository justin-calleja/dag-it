/**
 * This module contains helper functions to create and traverse [dependency graphs](https://en.wikipedia.org/wiki/Dependency_graph).
 * A dependency graph which can be traversed (no circular dependencies) forms a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph).
 * @module @justinc/dgraph
*/

const mapAll = require('@justinc/map-all')
const compose = require('compose-function')
const Validation = require('folktale/data/validation')
const Result = require('folktale/data/result')
const Maybe = require('folktale/data/maybe')
const graphlib = require('graphlib')
const defaultMappers = require('./mappers')
const gNodesToGParts = require('./gnodes-to-gparts')
const {
  combineValidations,
  chain,
  map,
  ap,
  validatorResultToValidation,
  asValidation
} = require('./utils')
const validateGParts = require('./validate-gparts')
const gPartsToGraph = require('./gparts-to-graph')

const { Success, Failure } = Validation
const { Just, Nothing } = Maybe

// /**
//  * @private
//  */
// const identity = x => x

/**
 * GParts is a type with all info needed to create a directed acyclic graph.
 * It's a Tuple of all node ids (at index 0), their depedencies (at index 1), their dependents (at index 2),
 * and their onVisit functions (at index 3).
 * Note that there's a correspondance at the index level, meaning that ids[0] is the id of a node, allDependencies[0],
 * are the node's dependencies, etc…
 * @typedef {Tuple< Array<String>, Array<Array<String>>, Array<Array<String>>, Array<OnVisit> >} GParts
 */

// const zip = (a, b) => zipWith((x, y) => [x, y], a, b)


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

// values :: Graph -> Array<String> -> Results
function values (graph) {
  return function valuesOf (ids) {
    return ids.reduce((acc, id) => {
      acc[id] = (graph.node(id) || {}).value
      return acc
    }, {})
  }
}

// 'successor' = 'dependency' or 'dependent' of a node
// successorValues :: Graph -> String -> Maybe Object<String, Value>
function successorValues (graph) {
  return function successorValuesOf (id) {
    const valuesOf = chain(values(graph))
    const successorsAsMaybe = successors(graph)(id)

    return valuesOf(successorsAsMaybe)
  }
}

// visitNode :: Graph -> String -> Result
function visitNode (graph) {
  return function visitNodeById (id) {
    const nodeAsMaybe = node(graph)(id)
    const successorValuesAsMaybe = successorValues(graph)(id)
    const valuesAsMaybe = nodeAsMaybe
      .map(node => node.onVisit)
      .ap(successorValuesAsMaybe)
    return valuesAsMaybe.getOrElse(null)
    // return graph.node(id).onVisit(successorResults(graph)(id))
  }
}

// go from ids -> Array<X> s.t. X now also has 'result'

/**
 * This is the type returned by an `onVisit` function. The actual type is up to you.
 * @typedef {*} Value
 */

/**
 * @typedef {Object} Node
 * @prop id {String}
 * @prop dependencies {Array<String>}
 * @prop dependents {Array<String>}
 * @prop onVisit {OnVisit}
 * @prop value {Value}
 */

// const traverseDAG = compose(
//   graphlib.alg.topsort
// )
// TODO: consider giving daggit only 'parts' (which you can get from extractParts)
// TODO: link to tutorial on how mondas / functors can be composed via `chain` and `map`
// input :: Array<Node>
function dagIt (mappers = defaultMappers) {
  return gNodes => {
    const gPartsAsResult = gNodesToGParts(mappers)(gNodes)

    return gPartsAsResult
      .chain(validateGParts)
      .chain(gPartsToGraph)
  }
}

module.exports = {
  dagIt
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
