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

module.exports = addNodes
