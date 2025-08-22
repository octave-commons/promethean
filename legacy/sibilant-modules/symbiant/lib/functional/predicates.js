"use strict";
var part = require("./partialApplication.js");
var bind = part.bind;
var defer = part.defer;
var partial = part.pre;
////////////////////////////////////////////////////////////////////////////////
function typeOf(s, x) {
    return typeof x === s;
}
////////////////////////////////////////////////////////////////////////////////
function instanceOf(t, x) {
    return x instanceof t;
}
////////////////////////////////////////////////////////////////////////////////
function isObject(x) {
    return typeOf("object", x) && x !== null;
}
////////////////////////////////////////////////////////////////////////////////
function isNull(x) {
    return x === null;
}
function isBuffer(b) {
    return Buffer.isBuffer();
}
////////////////////////////////////////////////////////////////////////////////
function isArray(a) {
    return Array.isArray(a);
}
////////////////////////////////////////////////////////////////////////////////
var getProp = part.curry(function getProp(s, o) {
    return o[s];
});
var isFunc = part.curry(typeOf)('function');
var compose = require("./functors.js").compose;
var is = {
    null: isNull,
    object: isObject,
    promise: compose(getProp('then'), isFunc),
    array: isArray,
    buffer:isBuffer,
    any: (() => true),
    typeof: part.curry(typeOf),
    undefined: part.curry(typeOf)("undefined"),
    string: part.curry(typeOf)("string"),
    instanceof: part.curry(instanceOf),
    function: part.curry(typeOf)("function"),
};
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
is.maybe = require("../wrappers/object.js")
    .mask(is)
    .map(c => part.curry(function(a, f, g) {
        if (c(a)) return f(a);
        return is.function(g) ? g(a) : (a) => a;
    }))
    .o;

var i = 0
is.maybe = require("../wrappers/object.js")
    .mask(is)
    .map(condition => {
        var f = function(value, then, otherwise) {
            if (condition(value)) return then(value);
            return is.function(otherwise) ? otherwise(value) : (value) => value;
        };
        return function(a,fx,gx) {

            var g = part.curry(function(fx, gx) {
                return f(a, fx, gx);
            });
            if (arguments.length === 1) {
                g.then = function(fx, gx) {
                    if (arguments.length === 1) {
                        var h = g(fx);
                        h.otherwise = h.catch = h
                        return h;
                    } else if(arguments.length > 1) {
                        return g(fx,gx);
                    }
                };
                return g;
            } else if (arguments.length === 2) {
                var h = g(fx);
                h.otherwise = h.catch = h
                return h;
            } else if(arguments.length === 3) {
                return g(fx,gx);
            }
        };
    })
    .o;
var print = partial(console.log.bind(console));
/*
is.maybe.object({})
    .then(print("1 is object"))
    .otherwise(print("1 is not object"));

is.maybe.object({})
    .then(print("2 is object"),
          print("2 is not object"));

is.maybe.object("")
    .then(print("3 is object"))
    .otherwise(print("3 is not object"));

is.maybe.object("")
    .then(print("4 is object"),
          print("4 is not object"));

is.maybe.object({},
                print("5 is object"),
                print("5 is not object"));
is.maybe.object("",
                print("6 is object"),
                print("6 is not object"));
 */
////////////////////////////////////////////////////////////////////////////////
module.exports = is;
