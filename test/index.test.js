import test from 'ava'
import { traverse } from '..'

// TODO; bring in property based testing: http://leebyron.com/testcheck-js/
// Is this even possible? Input generation concerns…

/*
graphI:

N2 → N4 → N1
     ↓
N3 ← N0 → N5
 */
const graphI = {
  dependenciesBased: [
    { id: 'N0', dependencies: [ 'N4' ] },
    { id: 'N1', dependencies: [ 'N4' ], onVisit: (env, id) => `id:${id}` },
    { id: 'N2' },
    { id: 'N3', dependencies: [ 'N0' ] },
    { id: 'N4', dependencies: [ 'N2' ] },
    { id: 'N5', dependencies: [ 'N0' ] }
  ],
  dependentsBased: [
    { id: 'N0', dependents: [ 'N3', 'N5' ] },
    { id: 'N1' },
    { id: 'N2', dependents: [ 'N4' ] },
    { id: 'N3' },
    { id: 'N4', dependents: [ 'N1', 'N0' ] },
    { id: 'N5' }
  ]
}

test('Should ... ', t => {
  const res = traverse(graphI.dependenciesBased)
  const resEntries = res.get().entries()
  console.log('resEntries:')
  for (let [, [, x]] of resEntries) {
    // console.log(a[1][1])
    console.log(x)
  }
  console.log('resEntries2:')
  // console.log('res:', res)
  const res2 = traverse(graphI.dependentsBased)
  const resEntries2 = res2.get().entries()
  for (let b of resEntries2) {
    console.log(b)
  }
  // console.log('res2:', res2)
})
