const graphlib = require('graphlib')
const repl = require('repl')
const Task = require('folktale/data/task')
const gNodesToGParts = require('../lib/gnodes-to-gparts')
const gNodesToGraph = require('../lib/gnodes-to-graph')
const gNodesToGPartsAsValidations = require('../lib/gnodes-to-gparts/as-validations')
const gPartsToEdges = require('../lib/gparts-to-edges')
const { dependencyEdges, dependentEdges } = require('../lib/gparts-to-edges/edges')
const mappers = require('../lib/mappers')
const defaults = require('../lib/mappers/defaults')
const validateGParts = require('../lib/validate-gparts')
const utils = require('../lib/utils')

const { addNodes, addEdges } = require('../lib/graph')

const r = repl.start('> ')

r.context.Task = Task

r.context.dagIt = {
  gNodesToGParts,
  gNodesToGraph,
  gNodesToGPartsAsValidations,
  gPartsToEdges,
  dependencyEdges,
  dependentEdges,
  utils,
  mappers,
  defaults,
  validateGParts
}


r.context.gNodes = [
  { id: 'N0', dependencies: [ 'N4' ] },
  { id: 'N1', dependencies: [ 'N4' ], onVisit: (env, id) => `id:${id}` },
  { id: 'N2' },
  { id: 'N3', dependencies: [ 'N0' ] },
  { id: 'N4', dependencies: [ 'N2' ] },
  { id: 'N5', dependencies: [ 'N0' ] }
]

r.context.gNodesToGraph = gNodes => {
  const gPartsAsResult = gNodesToGParts()(gNodes)

  return gPartsAsResult.chain(validateGParts).map(gParts => {
    const graph = new graphlib.Graph()
    addNodes(graph)(gNodes)(gParts[0])
    const edges = gPartsToEdges(gParts)
    addEdges(graph)(edges)
    return graph
  })
}
