const repl = require('repl')
const models = require('./models')
const Sequelize = require('sequelize')
const config = require('./config.json')
const { task, of } = require('folktale/data/task')
const { resolve } = require('path')
const graphModule = require('../../../lib/graph')
const {
  graphAsResult,
  visitAllMutative
  // visitAll
} = require('../../..')

config.storage = resolve(__dirname, config.storage)

var sequelize = new Sequelize(config.database, config.username, config.password, Object.assign(
  {},
  config,
  {
    logging: console.log
  })
)

const sq = models({ sequelize })

const itemInstanceTask = createOpts => {
  return task(resolver => {
    console.log('in itemInstance task computation')
    return sq.ItemInstance.create(createOpts).then(resolver.resolve)
  })
}

// TODO: try re-doing this with Fluture
const gNodes = [
  {
    id: 'item1',
    onVisit() {
      console.log('in item1 onVisit')
      return task(resolver => {
        console.log('in item1 task computation')
        return sq.Item.create().then(resolver.resolve)
      }).run().future()
    }
  },
  {
    id: 'itemInstance1',
    dependencies: [ 'item1' ],
    onVisit(depValues) {
      console.log('in itemInstance1 onVisit')
      const item1Future = depValues['item1']
      return item1Future.chain(item1 => itemInstanceTask({
        itemId: item1.id,
        version: 0
      }).run().future())
    }
  },
  {
    id: 'itemInstance2',
    dependencies: [ 'item1' ],
    onVisit(depValues) {
      console.log('in itemInstance2 onVisit')
      const item1Future = depValues['item1']
      return item1Future.chain(item1 => itemInstanceTask({
        itemId: item1.id,
        version: 1
      }).run().future())
    }
  }
]

const r = repl.start('> ')

// // TODO: parameterize sortedIds
// const reduce = graph => {
//   const { sort } = graphModule.ops(graph)
//   return sort().map(sortedIds => {
//     return sortedIds.reduce((acc, id) => {
//
//     })
//   })
// }

// sync() will drop the db and re-create it based on the models we're requiring
sq.sequelize.sync({ force: true }).then(function () {
  console.log('done syncing models with db')
  graphAsResult(gNodes).map(visitAllMutative).map(graph => {
    // // console.log('graph:', graph)
    // const { sort, nodeById } = graphModule.ops(graph)
    // const finalValueAsResult = sort().map(sortedIds => {
    //   return sortedIds.reduce((acc, id) => {
    //     const val = nodeById(id).unsafeGet().value
    //     return acc.chain(() => val)
    //   }, of('hello'))
    // })
    // // .unsafeGet()
    // r.context.finalValueAsResult = finalValueAsResult
    // // const finalValue = graph.reduce((acc, val) => {
    // //   return acc.chain(() => val)
    // // }, of('done'))
    // // console.log('finalValue:', finalValue)
    // finalValueAsResult.map(finalValue => {
    //   return finalValue.run().promise().then(finalResult => {
    //     console.log('finalResult:', finalResult)
    //   })
    // })
  })
})

      // return task(
      //   resolver => {
      //     sq.Item.create
      //   },
      //   // {
      //   //   cleanup(timerId) {
      //   //   },
      //   //   onCancelled(timerId) {
      //   //     /* does nothing */
      //   //   }
      //   // }
      // )

  // sq.Item.create().then(res => {
  //   console.log('item created, res:', res)
  //   r.context.res = res
  //   r.context.sq = sq
  // })
