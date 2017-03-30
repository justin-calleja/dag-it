const graphlib = require('graphlib')
const compose = require('folktale/core/lambda/compose').all
const { dependencyEdges, dependentEdges } = require('./edges')

/**
 * This function is curried.
 * @param  {Array<GNode>} gNodes
 * @param  {GParts} gParts
 * @return {Graph}
 */
const createGraph = gNodes => ([ids, allDependencies, allDependents, onVisits]) => {
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

module.exports = {
  createGraph
}
