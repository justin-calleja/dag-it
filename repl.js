const graphlib = require('graphlib')
const Task = require('folktale/data/task')
const repl = require('repl')
const gNode = require('./lib/gNode')
const utils = require('./lib/utils')
// const { defaultUnzippers } = require('./lib/unzippers')

const r = repl.start('> ')

r.context.Task = Task

r.context.dagIt = {
  gNode,
  utils
}

r.context.gNodes = [
  { id: 'N0', dependencies: [ 'N4' ] },
  { id: 'N1', dependencies: [ 'N4' ], onVisit: (env, id) => `id:${id}` },
  { id: 'N2' },
  { id: 'N3', dependencies: [ 'N0' ] },
  { id: 'N4', dependencies: [ 'N2' ] },
  { id: 'N5', dependencies: [ 'N0' ] }
]

const res = r.context.res = r.context.gNodes.map(gNode.unzipAsValidation())

r.context.unzippedGNodesAsValidation = utils.combineValidations(res)
