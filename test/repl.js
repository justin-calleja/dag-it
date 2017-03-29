const repl = require('repl')
const Task = require('folktale/data/task');
const dagNodesToGParts = require('../lib/dagnodes-to-gparts')
const dagNodesToGPartsAsValidations = require('../lib/dagnodes-to-gparts/as-validations')
const gPartsToEdges = require('../lib/gparts-to-edges')
const { dependencyEdges, dependentEdges } = require('../lib/gparts-to-edges/edges')
const mappers = require('../lib/mappers')
const validateGParts = require('../lib/validate-gparts')

const r = repl.start('> ')

r.context.Task = Task
r.context.dagNodesToGParts = dagNodesToGParts
r.context.dagNodesToGPartsAsValidations = dagNodesToGPartsAsValidation
r.context.gPartsToEdges = gPartsToEdges
r.context.dependencyEdges = dependencyEdges
r.context.dependentEdges = dependentEdges
r.context.mappers = mappers
r.context.validateGParts = validateGParts
