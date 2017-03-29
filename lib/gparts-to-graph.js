
// gPartsToGraph :: GParts -> Result<Array<Error>, Graph>
const gPartsToGraph = gParts => {
  try {
    const edges = partsToEdges(gParts)
    const [ids, allDependencies, allDependents, onVisits] = gParts
    const g = new graphlib.Graph()
    ids.reduce((g, id, i) => g.setNode(id, {
      id,
      dependencies: allDependencies[i],
      dependents: allDependents[i],
      onVisit: onVisits[i]
    }), g)
    edges.reduce((g, [from, to]) => g.setEdge(from, to), g)
    return Result.Ok(g)
  } catch (err) {
    return Result.Error([ err ])
  }
}
