// multimethod.js 0.1.0
//
// (c) 2011 Kris Jordan
//
// `multimethod` is freely distributable under the MIT license.
// For details and documentation: 
// [http://krisjordan.com/multimethod-js](http://krisjordan.com/multimethod-js)

(function() {

    // Multimethods are a functional programming control structure for dispatching 
    // function calls with user-defined criteria that can be changed at run time.
    // Inspired by clojure's multimethods, multimethod.js provides an alternative to
    // classical, prototype-chain based polymorphism.

    // ## Internal Utility Functions

    // No operation function used by default by `default`.
    var noop = function() {};

    // Identity `dispatch` function. Default value of `dispatch`.
    var identity = function(a) { return a; };

    // A `method` in `multimethod` is a (match value, function) pair stored in
    // an array. `indexOf` takes a value and array of methods and returns the 
    // index of the method whose value is equal to the first argument. If no 
    // match is found, false is returned.
    var indexOf = function(value, methods) {
        for(var i in methods) {
            var matches  = methods[i][0];
            if(_(value).isEqual(matches)) {
                return i;
            }
        }
        return false;
    }

    // Given a dispatch `value` and array of `method`s, return the function 
    // of the `method` whose match value corresponds to a dispatch value.
    var match = function(value, methods) {
        var index = indexOf(value, methods);
        if(index !== false) {
            return methods[index][1];
        } else {
            return false;
        }
    }

    // Simple, consistent helper that returns a native value or invokes a function
    // and returns its return value. Used by `when` and `default` allowing
    // short-hand notation for returning values rather than calling functions.
    var toValue = function(subject, args) {
        if(_.isFunction(subject)) {
            return subject.apply(this, args);
        } else {
            return subject;
        }
    };

    // Plucking a single property value from an object in `dispatch` is commonly
    // used. The internal `pluck` function returns a function suitable for use
    // by `dispatch` for just that purpose.
    var pluck = function(property) {
        return function(object) {
            return object[property];
        }
    };


    // ## Implementation 

    // `multimethod` is a higher-order function that returns a closure with 
    // methods to control its behavior.
    var multimethod = function(dispatch) { 

        // ### Private Properties

            // `_dispatch` holds either a dispatch function or a string 
            // corresponding to the property name whose value will be plucked 
            // and used as the `dispatch` criteria.
        var _dispatch,
            // `_methods` is a an array of `method` arrays. A `method` is
            // [ matchValue, implementation ].
            _methods   = [],
            // `_default` is the fallback method when a `multimethod` is called
            // and matches no other method.
            _default   = noop;

        // The fundamental control flow of the `multimethod` is implemented
        // in `_lookup`. First we invoke the dispatch function, this gives
        // us our match criteria. Then we match a method based on the criteria
        // or return the default method.
        var _lookup    = function() {
            var criteria    = _dispatch.apply(this, arguments),
                method      = match(criteria, _methods);
            if(method !== false) {
                return method;
            } else {
                return _default;
            }
        };

        // The result of calling `multimethod`'s "factory" function is this function.
        var returnFn  = function() {
            var method = _lookup.apply(this, arguments);
            return toValue.call(this, method, arguments);
        };

        // ### Member Methods / API

        // `dispatch` is the accessor to the `multimethod`'s `_dispatch` function.
        // When called with a string we create an anonymous pluck function as a 
        // shorthand.
        returnFn['dispatch'] = function(dispatch) {
            if(_.isFunction(dispatch)) {
                _dispatch = dispatch;
            } else if(_.isString(dispatch)) {
                _dispatch = pluck(dispatch);
            } else {
                throw "dispatch requires a function or a string.";
            }
            return this;
        }
        // If `multimethod` is called/"constructed" with a `dispatch` value we go ahead and set
        // it up here. Otherwise `dispatch` is the `identity` function.
        returnFn.dispatch(dispatch || identity);

        // `when` introduces new `method`s to a `multimethod`. If the
        // `matchValue` has already been registered the new method will
        // overwrite the old method.
        returnFn['when'] = function(matchValue, fn) {
            var index = indexOf(matchValue, _methods);
            if(index !== false) {
                _methods[index] = [matchValue, fn];
            } else {
                _methods.push([matchValue, fn]);
            }
            return this;
        }

        // `remove` will unregister a `method` based on matchValue
        returnFn['remove'] = function(matchValue) {
            var index = indexOf(matchValue, _methods);
            if(index !== false) {
                _methods.splice(index, 1);
            }
            return this;
        }

        // `default` is an accessor to control the `_default`, fallback method
        // that is called when no match is found when the `multimethod` is 
        // invoked and dispatched.
        returnFn['default'] = function(method) {
            _default = method;
            return this;
        }

        // Our `multimethod` instance/closure is fully setup now, return!
        return returnFn;
    };

    // The following snippet courtesy of underscore.js.
    // Export `multimethod` to the window/exports namespace.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = multimethod;
            var _ = require('underscore');
        }
        exports.multimethod = multimethod;
    } else if (typeof define === 'function' && define.amd) {
        define('multimethod', function() {
            return multimethod;
        });
    } else {
        this['multimethod'] = multimethod;
        var _ = this['_'];
    }

    multimethod.version = '0.1.0';

}).call(this);
