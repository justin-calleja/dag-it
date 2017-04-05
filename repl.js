const mapAll = require('@justinc/map-all')
const graphlib = require('graphlib')
const Task = require('folktale/data/task')
const repl = require('repl')
const gNode = require('./lib/gnode')
const utils = require('./lib/utils')
const Result = require('folktale/data/result')
const validateGParts = require('./lib/validate-gparts')
const compose = require('folktale/core/lambda/compose').all
const graphModule = require('./lib/graph')
const dagIt = require('./lib')

const createGraph = graphModule.create
// const { defaultUnzippers } = require('./lib/unzippers')

const unzipGNodeAsValidation = gNode.unzipAsValidation()

const r = repl.start('> ')

r.context.Task = Task
r.context.Result = Result
r.context.graphlib = graphlib

r.context.dagIt = dagIt

// const gNodes = r.context.gNodes = [
//   {
//     id: ''
//   },
//   {
//     id: ''
//   }
// ]

const gNodes = r.context.gNodes = [
  { id: 'N0', dependencies: [ 'N4' ] },
  {
    id: 'N1',
    dependencies: [ 'N4' ],
    onVisit: (arg) => {
      console.log('in N1 onVisit, arg:', arg)
      return 1
    }
  },
  {
    id: 'N2',
    onVisit: (arg) => {
      console.log('in N2 onVisit, arg:', arg)
      return 2
    }
  },
  { id: 'N3', dependencies: [ 'N0' ] },
  {
    id: 'N4',
    dependencies: [ 'N2' ],
    onVisit: (arg) => {
      console.log('in N4 onVisit, arg:', arg)
      return 4
    }
  },
  { id: 'N5', dependencies: [ 'N0' ] }
]

const unzippedGNodesAsValidation = r.context.unzippedGNodesAsValidation = utils.combineValidations(gNodes.map(unzipGNodeAsValidation))
const unzippedGNodesAsResult = r.context.unzippedGNodesAsResult = Result.fromValidation(unzippedGNodesAsValidation)

const graphAsResult = r.context.graphAsResult = compose(
  // ⬆ :: Graph
  utils.map(createGraph(gNodes)),
  utils.chain(validateGParts),
  // ⬆ :: GParts
  utils.map(mapAll([
    unzippedGNode => unzippedGNode[0],
    unzippedGNode => unzippedGNode[1],
    unzippedGNode => unzippedGNode[2],
    unzippedGNode => unzippedGNode[3]
  ]))
)(unzippedGNodesAsResult)

r.context.values = graphAsResult.chain(graph => {
  const { sort, visitNodesByIds } = graphModule.ops(graph)
  return sort().chain(ids => Result.fromMaybe(visitNodesByIds(ids)))
})

// NOTE: This code attempts to visit and **set** each node to the visit result:
// const finalGraphAsResult = r.context.finalGraphAsResult = graphAsResult.map(graph => {
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
//
// r.context.finalGraph = finalGraphAsResult.unsafeGet()
