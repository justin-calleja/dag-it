const Maybe = require('folktale/data/maybe')
const Result = require('folktale/data/result')
const graphlib = require('graphlib')
const { map } = require('../utils')
const sequence = require('@justinc/sequence')

const { Just, Nothing } = Maybe

/**
 * This function is curried.
 * @param  {Graph} graph
 * @param  {String} id
 * @return {Maybe<Array<String>>}
 * @see {@link https://github.com/cpettitt/graphlib/wiki/API-Reference#predecessors}
 */
// predecessors :: Graph -> String -> Maybe Array<String>
const predecessors = graph => id => {
  const ss = graph.predecessors(id)
  return ss ? Just(ss) : Nothing()
}

/**
 * This function is curried.
 * @param  {Graph} graph
 * @param  {String} id
 * @return {Maybe<GNode>}
 * @see {@link https://github.com/cpettitt/graphlib/wiki/API-Reference#node}
 */
// node :: Graph -> String -> Maybe GNode
const node = graph => id => {
  const n = graph.node(id)
  return n ? Just(n) : Nothing()
}

// TODO: wrap result value in an ADT (and update users of this function to work with the new ADT - Maybe / Result)
// values :: Graph -> Array<String> -> Array<Value>
const values = graph => ids => {
  return ids.reduce((acc, id) => {
    acc[id] = (graph.node(id) || {}).value
    return acc
  }, {})
}

// predecessorValues :: Graph -> String -> Maybe Object<String, Value>
const predecessorValues = graph => id => {
  const predecessorsAsMaybe = predecessors(graph)(id)
  const valuesOf = map(values(graph))
  return valuesOf(predecessorsAsMaybe)
}

// visitNode :: Graph -> String -> Maybe<Value>
const visitNode = graph => id => {
  const nodeAsMaybe = node(graph)(id)
  const predecessorValuesAsMaybe = predecessorValues(graph)(id)
  return nodeAsMaybe
    .map(node => node.onVisit)
    .ap(predecessorValuesAsMaybe)
}

// visitNodes :: Graph -> Array<String> -> Maybe<Array<Value>>
const visitNodes = graph => ids => {
  return sequence(Maybe.of)(ids.map(visitNode(graph)))
}

// sort :: Graph -> ResultOf<Array<String>>
const sort = (graph) => {
  try {
    return Result.Ok(graphlib.alg.topsort(graph))
  } catch (err) {
    return Result.Error([ err ])
  }
}

module.exports = {
  predecessors,
  node,
  values,
  predecessorValues,
  visitNode,
  visitNodes,
  sort
}
