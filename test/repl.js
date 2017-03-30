const repl = require('repl')
const Task = require('folktale/data/task');
const gNodesToGParts = require('../lib/gnodes-to-gparts')
const gNodesToGraph = require('../lib/gnodes-to-graph')
const gNodesToGPartsAsValidations = require('../lib/gnodes-to-gparts/as-validations')
const gPartsToEdges = require('../lib/gparts-to-edges')
const { dependencyEdges, dependentEdges } = require('../lib/gparts-to-edges/edges')
const mappers = require('../lib/mappers')
const defaults = require('../lib/mappers/defaults')
const validateGParts = require('../lib/validate-gparts')
const utils = require('../lib/utils')

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
