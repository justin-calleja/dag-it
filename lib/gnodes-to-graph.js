const defaultMappers = require('./mappers')
const gNodesToGParts = require('./gnodes-to-gparts')
const validateGParts = require('./validate-gparts')
const gPartsToGraph = require('./gparts-to-graph')

/**
 * This function is curried.
 * @param  {Mappers}
 * @param  {Array<GNode>}
 * @return {Graph}
 */
const gNodesToGraph = (mappers = defaultMappers) => {
  return gNodes => {
    const gPartsAsResult = gNodesToGParts(mappers)(gNodes)

    return gPartsAsResult
      .chain(validateGParts)
      .chain(gPartsToGraph)
  }
}

module.exports = gNodesToGraph
