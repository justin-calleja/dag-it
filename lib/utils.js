// const Validation = require('data.validation')
const Validation = require('folktale/data/validation')
const toValidation = require('@justinc/to-validation')

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

// function asValidation ([isValid, errors]) {
//   return isValid ? Success(true) : Failure(errors)
// }

// function ensureValidationFactory (isFailureLike) {
//   return toFailureMsg => obj => {
//     if (obj && (obj.isSuccess || obj.isFailure)) return obj
//
//     if (isFailureLike(obj)) {
//       toFailureMsg = toFailureMsg || (obj => `Validation failure given ${JSON.stringify(obj)}`)
//       return Failure([ new Error(toFailureMsg(obj)) ])
//     }
//
//     return Success(obj)
//   }
// }

// function isValidation (obj) {
//   return obj && (obj.isSuccess || obj.isFailure)
// }

// function toValidation (isFailureLike) {
//   return toFailure => obj => {
//     if (isValidation(obj)) return obj
//
//     if (isFailureLike(obj)) return toFailure(obj)
//
//     return toSuccess(obj)
//   }
// }

const toV = toValidation({ isValidation: v => Validation.hasInstance(v) })

const namedArgValidatorResultToValidation = toV({
  isFailureLike: ([isValid]) => !isValid,
  toFailure: ([, errors]) => Failure(errors),
  toSuccess: () => Success(true)
})
const validatorResultToValidation = v => namedArgValidatorResultToValidation({ v })

const namedArgAsValidation = toV({
  isFailureLike: v => v == null, // also catches undefined ("none" is null || undefined)
  toSuccess: v => Success(v)
})
const asValidation = toFailure => v => namedArgAsValidation({ toFailure, v })


module.exports = {
  validatorResultToValidation,
  asValidation
  chain: pointless('chain'),
  map: pointless('map'),
  ap: pointless('ap')
}
