// const Result = require('folktale/data/result')
// const graphlib = require('graphlib')

// const graph = gNodes => ids => edges => {
//   try {
//     const g = new graphlib.Graph()
//     ids.reduce((g, id, i) => g.setNode(id, gNodes[i]), g)
//     edges.reduce((g, [from, to]) => g.setEdge(from, to), g)
//     return Result.Ok(g)
//   } catch (err) {
//     return Result.Error([ err ])
//   }
// }

/**
 * This function is curried.
 * Mutates graph.
 * @param {Graph} graph
 * @param {Array<GNode>} gNodes
 * @param {Array<String>} ids
 * @return {Graph}
 */
const addNodes = graph => gNodes => ids => {
  return ids.reduce((g, id, i) => g.setNode(id, gNodes[i]), graph)
}

/**
 * This function is curried.
 * Mutates graph.
 * @param {Graph} graph
 * @param {Array<Tuple<String, String>>} edges
 * @return {Graph}
 */
const addEdges = graph => edges => {
  return edges.reduce((g, [from, to]) => g.setEdge(from, to), graph)
}

module.exports = {
  addNodes,
  addEdges
}
