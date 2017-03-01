// TODO: extract functions in this module in their own package
// TODO: generalize this. i.e. `chain` and `map` below do very similar things.
// I need a good name for the function but basically the idea is:
//
// methodName => fn => obj => obj[methodName](fn)

// given a fn which knows nothing of monads, returns a function which can chain (the original given fn) with the given monad.
function chain (fn) {
  return monad => monad.chain(fn)
}

// given a fn which knows nothing of functors, returns a function which can map (the original given fn) with the given functor.
function map (fn) {
  return functor => functor.map(fn)
}

module.exports = {
  chain,
  map
}