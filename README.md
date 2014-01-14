# What is multimethod.js? 

Multimethods are a functional programming control structure that allow you
to dynamically build-up and manipulate the dispatching behavior of a 
polymorphic function. Inspired by clojure's multimethods, multimethod.js 
provides a functional alternative to classical, prototype based polymorphism. 
The multimethod.js library is 1kb minified, MIT licensed, and available on
[GitHub](https://github.com/KrisJordan/multimethod-js).

# Installation

Install with `npm` for use in node.js based projects.

    npm install multimethod
    node
    > var multimethod = require('multimethod');

For in-browser use you will need to grab 
[underscore.js](http://documentcloud.github.com/underscore/) and multimethod.js:

- underscore.js
  - Development: http://documentcloud.github.com/underscore/underscore.js
  - Minified: http://documentcloud.github.com/underscore/underscore-min.js
- multimethod.js
  - Development: https://raw.github.com/KrisJordan/multimethod-js/master/multimethod.js
  - Minified: https://raw.github.com/KrisJordan/multimethod-js/master/multimethod-min.js

# API

- Constructor: `multimethod`( [fn | string] ):  No arg constructor uses an
  identity function for `dispatch`. Single arg constructor is a shortcut for
  calling `dispatch` with the same argument.
- `dispatch`(fn | string): Sets the `multimethod`'s `dispatch` function. String
  values are transformed into a pluck function which projects a single
  property value from the first argurment.
- `when`(match, fn | value): Add a `method` to be invoked when the `dispatch`
  return value matches 'match'. If a non-function `value` is provided it will
  be returned directly. Calling `when` with the same `match` value twice will 
  override the previously registered `method`.
- `remove`(match): Remove a `method` by it's `match` value.
- `default`(fn | value): Catch-all case when no `method` match is found.


# Motivating Examples

Let's use the node.js REPL to build a few multimethods and see what they are
capable of doing. In this first example we'll create a mulimethod that
calculates the area of shapes instantiated with object literals.

```javascript
> var multimethod = require('multimethod');
> var area = multimethod()
                .dispatch(function(o) {
                    return o.shape;
                })
                .when("square", function(o) {
                    return Math.pow(o.side, 2);
                });
> var aSquare = { "shape":"square", "side": 2 };
> area( aSquare );
4

> var aCircle = { "shape":"circle", "radius": 5 };
> area( aCircle );
undefined

> area.default(function(o) { 
    throw "Unknown shape: " + o.shape;
  });
> area( aCircle );
Unknown Shape: circle

> area.when("circle", function(o) {
    return Math.PI * Math.pow(o.radius, 2);
  });
> area( aCircle );
78.53981633974483
> area( aSquare );
4

> area.remove("circle");
> area( aCircle );
Unknown Shape: circle
```

Notice how `dispatch` returns the value we'll match to a "method" registered
with `when`. You can introduce, overwrite, and remove new methods dynamically at
runtime. Fallback behavior can be established with a `default` function called
when no methods match the dispatched value.

A recursive Fibonacci function can be expressed naturally with a multimethod.

```javascript
> var fib = multimethod()
                .when( 0, 0 )
                .when( 1, 1 )
                .default( function(n) {
                    return fib(n-1) + fib(n-2);
                });
> fib(20);
6765
```

Notice, there is no `dispatch` specified. By default a multimethod will use
the first argument it is invoked with to match the correct method to dispatch
to.

```javascript
> var hitPoints = multimethod()
                    .dispatch(function(player){ return player.powerUp; })
                    .when( {"type":"star"} , Infinity)
                    .default(5);

> var starPower = { "type":"star" },
>     mario = { "powerUp": starPower };
> hitPoints(mario);
Infinity

> mario.powerUp = null;
> hitPoints(mario);
5

> var godModeCheat = function() { return starPower; };
> hitPoints.dispatch(godModeCheat);
> mario.powerUp;
null
> hitPoints(mario);
Infinity
```

In this last example notice how we are matching against an object. Matching 
is done using deep equality so objects and arrays are valid method matching
criteria.  Also notice how we can completely override our dispatch 
function to change the logic with which a multimethod evaluates its arguments
for dispatch, or, in this case, ignores them!

# Multimethod Dispatch Algorithm Overview

1. User calls multimethod with argument `anArgument`.
2. Multimethod calls its `dispatch` function with `anArgument`. The returned 
   value is stored in `dispatchValue`.
3. Multimethod iterates through each 'method' registered with `when` and 
   performs an equality test on the `dispatchValue` and each method's match
   value. If a match is found, set `matchFunction` to the method's function 
   and go to step 5.
4. If no method match found, set `matchFunction` to the multimethod's `default`
   function.
5. Multimethod calls `matchFunction` with `anArgument`. The returned value
   is returned to the user who called the multimethod.

# Detailed Walkthrough

## The Basics

A `multimethod` is instantiated with the `multimethod` function.

```javascript
var stopLightColor = multimethod();
```
  
A `multimethod` has methods. A `method` is has two parts, its match value
and its implementation function. Methods are added using `when`.

```javascript
stopLightColor.when("go",    function() { return "green"; })
              .when("stop",  function() { return "red"; });
```

You can call a `multimethod` just like any other function. It will dispatch
based on the argument(s) passed in, invoke the matched `method`, and return 
the results of the `method` call.

```javascript
console.log( stopLightColor("go") ); // "green"
```

When no method matches control can fallback to a `default` method.

```javascript
stopLightColor.default( function() { return "unknown"; } );
console.log( stopLightColor("yield") ); // prints "unknown"
```

A `multimethod` can handle new cases dynamically at run time.

```javascript
stopLightColor.when("yield", function() { return "yellow"; });
```

There is a shorter way for a `method` to return a plain value. Rather than 
passing an implementation function to `when`, pass the value. 

```javascript
stopLightColor.when("yield", "yellow");
console.log( stopLightColor("yield") ); // prints "yellow"
```

A `method` can be removed dynamically at run time, too.

```javascript
stopLightColor.remove("go");
console.log( stopLightColor("go") ); // prints "unknown"
```

## Dispatch Function

Each `multimethod` call first invokes a `dispatch` function whose return value
is used to match the correct `method` to call. The `dispatch` function is 
passed the arguments the `multimethod` is invoked with and returns a value
to match against.

The default `dispatch` function is an identity function. 
The basic `stopLightColor` examples could have been 
created with an explicit `dispatch` function.

```javascript
var stopLightColor = multimethod()
      .dispatch(function(state){
         return state;
      })
      .when('go', 'green');
console.log( stopLightColor('go') ); // green
```

The power of the `multimethod` paradigm is the ability to dispatch with a
user-defined function. This gives a `multimethod` its "polymorphic" powers. 
Unlike classical, object-oriented polymorphism where the compiler dispatches 
based on the type hierarchy, a `multimethod` can dispatch on any criteria.

```javascript
var contacts = [
  {"name":"Jack", "service":"Twitter","handle": "@jack"},
  {"name":"Diane","service":"Email",  "address":"d@g.com"},
  {"name":"John", "service":"Phone",  "number": "919-919-9191"}
];

var sendMessage = multimethod()
     .dispatch(function(contact, msg) {
       return contact.service;
     })
     .when("Twitter", function(contact, msg) {
       console.log("Tweet @"+contact.handle+":"+msg);
     })
     .when("Email", function(contact, msg) {
       console.log("Emailing "+contact.address+":"+msg);
     })
     .default(function(contact, msg) {
       console.log("Could not message " + contact.name);
     });

// Blast a message
contacts.forEach( function(contact) {
  sendMessage(contact, "Hello, world."); 
});
```

Plucking a single property from an object is so commonly used as a `dispatch`
function, like in the example above, there is a shortcut for this pattern. 
The following `dispatch` call is equivalent to above.

```javascript
sendMessage.dispatch( 'service' );
```

A `multimethod`'s `dispatch` is usually specified when constructed.

```javascript
var sendMessage = multimethod('service');
```

Just like `method`s can be added and removed from a `multimethod` at 
run time, the `dispatch` function can also be redefined at run time.
Ponder the implications of that for a minute. It is really powerful and 
really dangerous. Don't shoot your eye out.

## Deep Equality Matching

A `method`'s match value is compared to `dispatch`'s return value 
using the underscore.js 
[`isEqual`](http://documentcloud.github.com/underscore/#isEqual)
function. Deep equality `method` matching enables concise expressivity.
Contrast this with a traditional `switch` statement that is
limited by JavaScript's === equality behavior.

```javascript
var greatPairs = multimethod()
      .when( ["Salt", "Pepper"], "Shakers" )
      .when( [{"name":"Bonnie"}, {"name":"Clyde"}], "Robbers" );
console.log( greatPairs( ["Salt", "Pepper"] ) ); // Shakers
```

## Related Work

* Clojure's multimethod - http://clojure.org/multimethods
* Pascal Coste Filtered Dispatch in Common Lisp - http://www.p-cos.net/documents/filtered-dispatch.pdf

## How-to Contribute

* Submit bugs and feature requests on 
[GitHub Issues](https://github.com/KrisJordan/multimethod-js/issues) page.
* Fork the repository and submit pull requests. Pull requests that update
  the test suite for coverage on changes will be brought in quickly.
