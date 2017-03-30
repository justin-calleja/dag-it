const flatten = require('lodash.flatten')
const zipWith = require('lodash.zipwith')

const dependencyEdges = (ids, allDependencies) => {
  return flatten(zipWith(ids, allDependencies, (id, ds) => ds.map(d => [d, id])))
}

const dependentEdges = (ids, allDependents) => {
  return flatten(zipWith(ids, allDependents, (id, ds) => ds.map(d => [id, d])))
}

module.exports = {
  dependencyEdges,
  dependentEdges
}
