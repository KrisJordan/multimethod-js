// multimethod.js 0.0.1
//
// (c) 2011 Kris Jordan
//
// Multimethod is freely distributable under the MIT license.
// For details and documentation: 
// [http://krisjordan.com/multimethod-js](http://krisjordan.com/multimethod-js)

(function() {

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

    // Given a key value and array of methods, return the function of the method
    // whose key corresponds
    var match = function(value, methods) {
        var index = indexOf(value, methods);
        if(index !== false) {
            return methods[index][1];
        } else {
            return false;
        }
    }

    var toValue = function(subject, args) {
        if(_.isFunction(subject)) {
            return subject.apply(this, args);
        } else {
            return subject;
        }
    };

    var multimethod = function(dispatch) { 
        var _dispatch,
            _methods   = [],
            _default   = noop;

        var _lookup    = function() {
            var criteria    = _dispatch.apply(this, arguments),
                method      = match(criteria, _methods);
            if(method !== false) {
                return method;
            } else {
                return _default;
            }
        };

        var returnFn  = function() {
            var method = _lookup.apply(this, arguments);
            return toValue.call(this, method, arguments);
        };

        returnFn.dispatch = function(dispatch) {
            if(_.isFunction(dispatch)) {
                _dispatch = dispatch;
            } else if(_.isString(dispatch)) {
                _dispatch = function(object) {
                    return object[dispatch];
                }
            }
            return this;
        }
        returnFn.dispatch(dispatch || identity);

        returnFn.when = function(value, method) {
            var index = indexOf(value, _methods);
            if(index !== false) {
                _methods[index] = [value, method];
            } else {
                _methods.push([value, method]);
            }
            return this;
        }

        returnFn.remove = function(value) {
            var index = indexOf(value, _methods);
            if(index !== false) {
                _methods.splice(index, 1);
            }
            return this;
        }

        returnFn.default = function(method) {
            _default = method;
            return this;
        }

        return returnFn;
    };

    // The following snippet courtesy of underscore.js & Jeremy Ashkenas
    // Export multimethod to the window/exports namespace.
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

    multimethod.version = '0.0.1';

}).call(this);
