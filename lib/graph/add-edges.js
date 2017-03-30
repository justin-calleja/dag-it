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

module.exports = addEdges
