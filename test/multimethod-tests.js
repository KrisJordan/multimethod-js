$(document).ready(function() {

    module("Multimethods");

    var helpers = {
        "plus1": function(n) { return n + 1; },
        "sum":   function(a,b) { return a + b; },
        "product": function(a,b) { return a * b; }
    }

    test("identity default", function() {
        var mm = multimethod();
        equals(mm(1), undefined);
    });

    test("identity project function", function() {
        var mm = multimethod().when(1,helpers.plus1);
        equals(mm(1),2);
    });

    test("default project function", function() {
        var mm = multimethod().default(helpers.plus1);
        equals(mm(1),2);
    });

    test("when returns primitive values", function() {
        var mm = multimethod().when(1,2);
        equals(mm(1),2);

        var mm = multimethod().when(1,true);
        equals(mm(1),true);

        var mm = multimethod().when(1,"string");
        equals(mm(1),"string");
    });

    test("when chains and selects correct value", function() {
        var mm = multimethod()
                    .when(1,"one")
                    .when(2,"two")
                    .when(3,"three");
        equals(mm(1),"one");
        equals(mm(2),"two");
        equals(mm(3),"three");
    });

    test("multiple arguments", function() {
        var mm = multimethod(function(a, b) { return [a, b]; })
                    .when([1,1], helpers.sum)
                    .when([3,3], helpers.product);
        equals(mm(1,1),2);
        equals(mm(3,3),9);
    });

    test("modify project function", function() {
        var mm = multimethod()
                    .project(helpers.plus1)
                    .when(2,helpers.plus1);
        equals(mm(1),2);
    });

    test("override method", function() {
        var mm = multimethod()
                    .when(1, 1)
                    .when(1, 2);
        equals(mm(1),2);
    });

    test("remove method", function() {
        var mm = multimethod()
                    .when(1,1)
                    .default(2)
                    .remove(1);
        equals(mm(1),2);
    });
});
