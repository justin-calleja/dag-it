const Future = require('fluture')
// const { futurizeP } = require('futurize')

const X = 2

const Y = models => {
  return modelName => data => {
    return Future.fromPromise(models[modelName].create)(data)
  }
}

const models = {}

const y = Y(models)

X([ 'itemId1', () => y('Item')({}) ])

X(['itemId1', 'itemInstanceId1', (itemId1) => {
  return y('ItemInstance')({
    itemId: itemId1,
    version: 0,
    value: ''
  })
}])

X(['itemId1', 'itemInstanceId2', (itemId1) => {
  return y('ItemInstance')({
    itemId: itemId1,
    version: 1,
    value: `{ name: 'Jack' }`
  })
}])

X(['itemId1', 'itemInstanceId1', 'log1', (itemId1, itemInstanceId1) => {
  return Future((rej, res) => {
    console.log('itemId1:', itemId1)
    console.log('itemInstanceId1:', itemInstanceId1)
    res()
  })
}])

const idMapper = (ds, i) => {

}
