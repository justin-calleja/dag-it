const { dependencyEdges, dependentEdges, extractParts } = require('./lib')
const Future = require('fluture')

const n1OnVisit = ([ id, { N4 } ]) => {
  return Future.of(`id: ${id} has N4: ${N4}`)
}

const graphI = {
  dependenciesBased: [
    { id: 'N0', dependencies: [ 'N4' ] },
    { id: 'N1', dependencies: [ 'N4' ], onVisit: n1OnVisit },
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

let partsAsEither = extractParts(graphI.dependenciesBased)

console.log(partsAsEither)

partsAsEither.map(([ids, allDependencies, allDependents]) => {
  console.log('ids:', ids)
  console.log('allDependencies:', allDependencies)
  let depEdges = dependencyEdges(ids, allDependencies)
  console.log('>>', depEdges)
})
