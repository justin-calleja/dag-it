const compose = require('folktale/core/lambda/compose').all
const Validation = require('folktale/data/validation')
const { defaultUnzippers } = require('../unzippers')
const { asValidation, combineValidations } = require('../utils')

const Failure = Validation.Failure

/**
 * This function is curried.
 * @param  {Unzippers} [unzippers=defaultUnzippers]
 * @param  {GNode} [gNode]
 * @return {ValidationOf<UnzippedGNode>}
 */
const unzipAsValidation = (unzippers = defaultUnzippers) => {
  // Note: if users specify custom unzippers, they will likely not be unzipping the exact keys 'id', 'dependencies', 'dependents', 'onVisit'.
  // To get proper error reporting in that case, users must return a Validation<Array(Error), Any> from their unzippers.
  // i.e. I'm hard-coding the names in the error messages to use 'id' etc…

  const idUnzipper = node => compose(
    asValidation(v => Failure([ new Error(`No id found in ${JSON.stringify(node)}`) ])),
    unzippers.id
  )(node)

  const dependenciesUnzipper = node => compose(
    asValidation(v => Failure([ new Error(`No dependencies found in ${JSON.stringify(node)}`) ])),
    unzippers.dependencies
  )(node)

  const dependentsUnzipper = node => compose(
    asValidation(v => Failure([ new Error(`No dependents found in ${JSON.stringify(node)}`) ])),
    unzippers.dependents
  )(node)

  const onVisitUnzipper = node => compose(
    asValidation(v => Failure([ new Error(`No onVisit found in ${JSON.stringify(node)}`) ])),
    unzippers.onVisit
  )(node)

  return gNode => combineValidations([
    idUnzipper(gNode),
    dependenciesUnzipper(gNode),
    dependentsUnzipper(gNode),
    onVisitUnzipper(gNode)
  ])
}

module.exports = unzipAsValidation
