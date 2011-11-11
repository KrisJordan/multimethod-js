(function() {

    var root = this;

    var noop = function() {};

    var identity = function(a) { return a; };

    var indexOf = function(value, methods) {
        for(var i in methods) {
            var matches  = methods[i][0];
            if(_(value).isEqual(matches)) {
                return i;
            }
        }
        return false;
    }

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

    var multimethod = function(project) { 
        var _project  = project || identity;
        var _methods   = [];
        var _default   = noop;

        var _lookup    = function() {
            var criteria    = _project.apply(this, arguments),
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

        returnFn.project = function(project) {
            _project = project;
            return this;
        }

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
                _methods.splice(index,1);
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
        }
        exports.multimethod = multimethod;
    } else if (typeof define === 'function' && define.amd) {
        define('multimethod', function() {
            return multimethod;
        });
    } else {
        root['multimethod'] = multimethod;
    }

    multimethod.version = '0.0.1';

}).call(this);
