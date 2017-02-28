import test from 'ava'
import x from '..'

// TODO; bring in property based testing: http://leebyron.com/testcheck-js/
// Is this even possible? Input generation concerns…

/*
graphI:

N0 → N1 → N4
     ↓
N3 ← N2 → N5

N2 → N4 → N1
     ↓
N3 ← N0 → N5
 */
const graphI = {
  // dependenciesBased: [
  //   { id: 'N0' },
  //   { id: 'N1', dependencies: [ 'N0' ] },
  //   { id: 'N2', dependencies: [ 'N1' ] },
  //   { id: 'N3', dependencies: [ 'N2' ] },
  //   { id: 'N4', dependencies: [ 'N1' ] },
  //   { id: 'N5', dependencies: [ 'N2' ] }
  // ],
  // dependentsBased: [
  //   { id: 'N0', dependents: [ 'N1' ] },
  //   { id: 'N1', dependents: [ 'N2', 'N4' ] },
  //   { id: 'N2', dependents: [ 'N3', 'N5' ] },
  //   { id: 'N3', dependents: [] },
  //   { id: 'N4', dependents: [] },
  //   { id: 'N5', dependents: [] }
  // ]
  dependenciesBased: [
    { id: 'N0', dependencies: [ 'N4' ] },
    { id: 'N1', dependencies: [ 'N4' ] },
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
  const res = x(graphI.dependenciesBased)
  console.log('res:', res)
  const res2 = x(graphI.dependentsBased)
  console.log('res2:', res2)
})
