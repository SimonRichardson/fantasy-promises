var daggy = require('daggy'),
    Option = require('fantasy-options');
/**
    # Fantasy Promises

    This library implements purely functional, monadic promises.
**/

/**
    ## `Promise(fork)`

    Promise is a constructor which takes a `fork` function. The `fork`
    function takes one argument:

    ### `fork(resolve)`

    The `resolve` callback gets called on a value.
**/
var Promise = daggy.tagged('fork');

/**
    ### `Promise.of(x)`

    Creates a Promise that contains a successful value.
**/
Promise.of = function(x) {
    return Promise(function(resolve) {
        return resolve(x);
    });
};

/**
    ### `ap(x)`

    Returns a new promise that evaluates `f` on a value and passes it
    through to the resolve function.
**/
Promise.prototype.ap = function(a) {
    var promise = this;
    return Promise(function(resolve) {
        var f = Option.None,
            v = Option.None;
        promise.fork(function(x) {
            f = Option.Some(x);
            v.map(x).chain(resolve);
        });
        a.fork(function(x) {
            v = Option.Some(x);
            f.ap(v).chain(resolve);
        });
    });
};

/**
    ### `chain(f)`

    Returns a new promise that evaluates `f` when the current promise
    is successfully fulfilled. `f` must return a new promise.
**/
Promise.prototype.chain = function(f) {
    var promise = this;
    return Promise(function(resolve) {
        return promise.fork(function(a) {
            return f(a).fork(resolve);
        });
    });
};

/**
    ### `map(f)`

    Returns a new promise that evaluates `f` on a value and passes it
    through to the resolve function.
**/
Promise.prototype.map = function(f) {
    var promise = this;
    return Promise(function(resolve) {
        return promise.fork(function(a) {
            return resolve(f(a));
        });
    });
};

/**
   ### `extract()`

   Executes a promise to get a value.
**/
Promise.prototype.extract = function() {
    return this.fork(function(data) {
        return data;
    });
};

/**
   ### `extend(f)`

   Returns a new promise that evaluates `f` over the promise to get a
   value.
**/
Promise.prototype.extend = function(f) {
    var promise = this;
    return promise.map(function(a) {
        return f(Promise.of(a));
    });
};

// Export
if (typeof module != 'undefined')
    module.exports = Promise;
