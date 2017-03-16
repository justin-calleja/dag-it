const Validation = require('data.validation')

const { Success, Failure } = Validation

// // given a fn which knows nothing of monads, returns a function which can chain (the original given fn) with the given monad.
// function chain (fn) {
//   return monad => monad.chain(fn)
// }
//
// // given a fn which knows nothing of functors, returns a function which can map (the original given fn) with the given functor.
// function map (fn) {
//   return functor => functor.map(fn)
// }

function pointless (methodName) {
  return fn => adt => adt[methodName](fn)
}

function asValidation ([isValid, errors]) {
  return isValid ? Success(true) : Failure(errors)
}

function ensureValidationFactory (isFailureLike) {
  return toFailureMsg => obj => {
    if (obj && (obj.isSuccess || obj.isFailure)) return obj

    if (isFailureLike(obj)) {
      toFailureMsg = toFailureMsg || (obj => `Validation failure given ${JSON.stringify(obj)}`)
      return Failure([ new Error(toFailureMsg(obj)) ])
    }

    return Success(obj)
  }
}

module.exports = {
  chain: pointless('chain'),
  map: pointless('map'),
  asValidation,
  ensureValidationFactory
}
