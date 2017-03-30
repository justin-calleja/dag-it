const mapAll = require('@justinc/map-all')
const graphlib = require('graphlib')
const compose = require('folktale/core/lambda/compose').all
const { dependencyEdges, dependentEdges } = require('./edges')
const addNodes = require('./add-nodes')
const addEdges = require('./add-edges')

/**
 * This function is curried.
 * @param  {Array<GNode>} gNodes
 * @param  {Array<UnzippedGNode>} unzippedGNodes
 * @return {Graph}
 */
const createGraph = gNodes => unzippedGNodes => {
  const graph = new graphlib.Graph()

  // :: Tuple< ids::Array<String>, allDependencies::Array<Array<String>>, allDependents::Array<Array<String>> >
  const [ids, allDependencies, allDependents] = mapAll([
    unzippedGNode => unzippedGNode[0],
    unzippedGNode => unzippedGNode[1],
    unzippedGNode => unzippedGNode[2]
  ])(unzippedGNodes)

  const edges = [ ...dependencyEdges(ids, allDependencies), ...dependentEdges(ids, allDependents) ]
  addNodes(graph)(gNodes)(ids)
  addEdges(graph)(edges)

  return graph
}

module.exports = {
  createGraph
}
