const graphlib = require('graphlib')
const compose = require('folktale/core/lambda/compose').all
const Maybe = require('folktale/data/maybe')
const Result = require('folktale/data/result')
const { dependencyEdges, dependentEdges } = require('./edges')
const { map } = require('../utils')
const graphOps = require('./ops')

const { Just, Nothing } = Maybe

/**
 * This function is curried.
 * @param  {Array<GNode>} gNodes
 * @param  {GParts} gParts
 * @return {Graph}
 */
const create = gNodes => ([ids, allDependencies, allDependents, onVisits]) => {
  const graph = new graphlib.Graph()
  const edges = [ ...dependencyEdges(ids, allDependencies), ...dependentEdges(ids, allDependents) ]

  // add nodes:
  ids.reduce((g, id, i) => {
    const node = Object.assign(
      {},
      gNodes[i],
      { id, dependencies: allDependencies[i], dependents: allDependents[i], onVisit: onVisits[i] }
    )
    return g.setNode(id, node)
  }, graph)

  // add edges:
  edges.reduce((g, [from, to]) => g.setEdge(from, to), graph)

  return graph
}

const ops = graph => {
  // predecessorsOf :: String -> Maybe Array<String>
  const predecessorsOf = graphOps.predecessors(graph)

  // nodeById :: String -> Maybe GNode
  const nodeById = graphOps.node(graph)

  // valuesOf :: Array<String> -> Array<Value>
  const valuesOf = graphOps.values(graph)

  // predecessorValuesOf :: String -> Maybe Object<String, Value>
  const predecessorValuesOf = graphOps.predecessorValues(graph)

  // visitNodeById :: String -> Maybe<Value>
  const visitNodeById = graphOps.visitNode(graph)

  // visitNodesByIds :: Array<String> -> Maybe<Array<Value>>
  const visitNodesByIds = graphOps.visitNodes(graph)

  // sort :: () -> ResultOf<Array<String>>
  const sort = () => graphOps.sort(graph)

  return {
    predecessorsOf,
    nodeById,
    valuesOf,
    predecessorValuesOf,
    visitNodeById,
    visitNodesByIds,
    sort
  }
}

module.exports = {
  create,
  ops
}
