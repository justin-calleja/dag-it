const { dependencyEdges, dependentEdges } = require('./edges')

// gPartsToEdges :: GParts -> Array<Tuple<String, String>>
const gPartsToEdges = ([ids, allDependencies, allDependents]) => {
  return [ ...dependencyEdges(ids, allDependencies), ...dependentEdges(ids, allDependents) ]
}

module.exports = gPartsToEdges
