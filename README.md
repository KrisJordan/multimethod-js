# Motivation

Multimethods are a functional programming control structure for dispatching 
function calls with user-defined criteria that can be changed at run time.
Inspired by clojure's multimethods, multimethod.js provides an alternative to
classical, prototype-chain based polymorphism.

# Usage

## The Basics

A `multimethod` is instantiated with the `multimethod` function.

    var stopLightColor = multimethod();
  
A `multimethod` has methods. A `method` is has two parts, its match value
and its implementation function. Methods are added using `when`.

    stopLightColor.when("go",    function() { return "green"; })
                  .when("stop",  function() { return "red"; });

You can call a `multimethod` just like any other function.

    var goColor = stopLightColor("go");
    console.log(goColor); // prints "green"

When no method matches a `multimethod` it can take action with a `default` method.

    stopLightColor.default( function() { return "unknown"; } );
    console.log( stopLightColor("yield") ); // prints "unknown"

Unlike `switch` statements, a `multimethod` can handle new cases at run time.

    stopLightColor.when("yield", function() { return "yellow"; });

There is a shorter way for a `method` to return a simple value. Rather than 
passing an implementation function to `when`, provide the value. 

    stopLightColor.when("yield", "yellow");
    console.log( stopLightColor("yield") ); // prints "yellow"

A `method` can be removed at run time.

    stopLightColor.remove("go");
    console.log( stopLightColor("go") ); // prints "unknown"

## Deep Equality Matching

Method match values are compared using the underscore.js 
[`isEqual`](http://documentcloud.github.com/underscore/#isEqual)
function. Deep equality testing allows great expressivity than a native 
`switch` statement.

    var greatPairs = multimethod()
          .when( ["Salt", "Pepper"], "Shakers" )
          .when( [{"name":"Bonnie"}, {"name":"Clyde"}], "Robbers" );

    console.log( greatPairs( ["Salt", "Pepper"] ) ); // Shakers

## Dispatch Function

Each `multimethod` uses a `dispatch` function to select the
`method` to call. The `dispatch` function is passed the arguments
the `multimethod` is invoked with and returns a value to match
with a `method`.

The default `dispatch` function is an identity function. 
The basic `stopLightColor` examples could have been 
created with an explicit `dispatch` function.

    var stopLightColor = multimethod()
          .dispatch(function(state){
             return state;
          })
          .when('go', 'green');
    console.log( stopLightColor('go') ); // green

The power of the `multimethod` paradigm is the ability to dispatch with a
user-defined function. This gives a `multimethod` its "polymorphic" powers. 
Unlike classical, object-oriented polymorphism where the compiler dispatches 
based on the type hierarchy, a `multimethod` can dispatch on any criteria.

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

Plucking a single property from an object is so commonly used as a `dispatch`
function, like in the example above, there is a shortcut for this pattern. 
The following `dispatch` call is equivalent to above.

    sendMessage.dispatch( 'service' );

A `multimethod`'s `dispatch` is usually specified when constructed.

    var sendMessage = multimethod('service');

Just like `method`s can be added and removed from a `multimethod` at 
run time, the `dispatch` function can also be redefined at run time.
Ponder the implications of that for a minute. It is really powerful and 
really dangerous. Don't shoot your eye out.

# API

- Constructor: `multimethod`( [fn | string] ):  If empty, identity projection used, otherwise same as project.
- `project`(fn | string): Sets the multimethod's projection function. String values are transformed into a pluck function which projects a single property from an object argument.
- `when`(match, fn | value): Add a method when the projected value matches 'match'. If a non-function value is provided it will be used. Using the same match value twice will override previously set match value and method.
- `remove`(match): Remove a method/match pair.
- `default`(fn | value): Catch-all case when no other matched method is found.

# Dependencies
 
- Underscore.js
