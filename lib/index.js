const gNode = require('./gnode')
const validateGParts = require('./validate-gparts')
const mapAll = require('@justinc/map-all')
const compose = require('folktale/core/lambda/compose').all
const Result = require('folktale/data/result')
const { combineValidations, map, chain } = require('./utils')
const graphModule = require('./graph')

// default unzippers:
const unzipGNodeAsValidation = gNode.unzipAsValidation()

// TODO: add param for custom unzippers
// :: Array<GNode> -> ResultOf<Graph>
const graphAsResult = gNodes => {
  const unzippedGNodesAsValidation = combineValidations(gNodes.map(unzipGNodeAsValidation))
  const unzippedGNodesAsResult = Result.fromValidation(unzippedGNodesAsValidation)

  return compose(
    // ⬆ :: ResultOf<Graph>
    map(graphModule.create(gNodes)),
    // ⬆ :: ResultOf<GParts>
    chain(validateGParts),
    // ⬆ :: ResultOf<GParts>
    map(mapAll([
      unzippedGNode => unzippedGNode[0],
      unzippedGNode => unzippedGNode[1],
      unzippedGNode => unzippedGNode[2],
      unzippedGNode => unzippedGNode[3]
    ]))
  )(unzippedGNodesAsResult)
}

// TODO: parameterize sortedIds
// visitAll :: Graph -> Result
const visitAll = graph => {
  const { sort, visitNodesByIds } = graphModule.ops(graph)
  return sort().chain(ids => Result.fromMaybe(visitNodesByIds(ids)))
}

// TODO: re-think this
const visitAllMutative = graph => {
  const { sort, visitNodeById } = graphModule.ops(graph)
  return sort().chain(sortedIds => {
    sortedIds.forEach(id => {
      const valueAsMaybe = visitNodeById(id)
      // mutates!!
      graph.setNode(id, Object.assign({}, graph.node(id), { value: valueAsMaybe.unsafeGet() }))
    })
    return graph
  })
}

// const mutativeTraverse = graph => {
//   const { visitNodeById } = graphModule.ops(graph)
//
//   const sortedIds = graphlib.alg.topsort(graph)
//   sortedIds.forEach(id => {
//     const valueAsMaybe = visitNodeById(id)
//     // mutates!!
//     graph.setNode(id, Object.assign({}, graph.node(id), { value: valueAsMaybe.unsafeGet() }))
//   })
//
//   return graph
// }

// const finalGraphAsResult = graphAsResult.map(graph => {
//   const { visitNodeById } = graphModule.ops(graph)
//
//   const sortedIds = graphlib.alg.topsort(graph)
//   sortedIds.forEach(id => {
//     const valueAsMaybe = visitNodeById(id)
//     // mutates!!
//     graph.setNode(id, Object.assign({}, graph.node(id), { value: valueAsMaybe.unsafeGet() }))
//   })
//
//   return graph
// })

module.exports = {
  graphAsResult,
  visitAll,
  visitAllMutative
}
