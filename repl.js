const Task = require('folktale/data/task')
const repl = require('repl')
const gNode = require('./lib/gnode')
const utils = require('./lib/utils')
const Result = require('folktale/data/result')
const validateUnzippedGNodes = require('./lib/validate-unzipped-gnodes')
const compose = require('folktale/core/lambda/compose').all
const { createGraph } = require('./lib/graph')
// const { defaultUnzippers } = require('./lib/unzippers')

const unzipGNodeAsValidation = gNode.unzipAsValidation()

const r = repl.start('> ')

r.context.Task = Task
r.context.Result = Result

r.context.dagIt = {
  gNode,
  utils
}

const gNodes = r.context.gNodes = [
  { id: 'N0', dependencies: [ 'N4' ] },
  { id: 'N1', dependencies: [ 'N4' ], onVisit: (env, id) => `id:${id}` },
  { id: 'N2' },
  { id: 'N3', dependencies: [ 'N0' ] },
  { id: 'N4', dependencies: [ 'N2' ] },
  { id: 'N5', dependencies: [ 'N0' ] }
]

const unzippedGNodesAsValidation = r.context.unzippedGNodesAsValidation = utils.combineValidations(gNodes.map(unzipGNodeAsValidation))
const unzippedGNodesAsResult = r.context.unzippedGNodesAsResult = Result.fromValidation(unzippedGNodesAsValidation)
// const validatedUnzippedGNodesAsResult = r.context.validatedUnzippedGNodesAsResult =

const graphAsResult = r.context.graphAsResult = compose(
  // ⬆ :: Graph
  utils.map(createGraph(gNodes)),
  utils.chain(validateUnzippedGNodes)
)(unzippedGNodesAsResult)
