"use strict";
var curry = require("./partialApplication.js").curry;
////////////////////////////////////////////////////////////////////////////////
function conditional(cond, success,  x) {
    /*if (!is.function(g) || is.undefined(x)) {
        g = (x) => x;
    }*/
    return cond(x) ? success(x) : false;
}
function biConditional (cond, success,fail,...x) {
    return cond(...x) ? success(...x) : fail(...x);
}
conditional.binary = biConditional;
conditional.unary = conditional;
function maybe(f,x) {
    return conditional(
        ((x) => ((x !== null && x!== undefined) )),
        f, x);
};
function biMaybe(f,g,...x) {
    return biConditional(
        ((x) => ((x !== null && x!== undefined) )),
        f,
        g || (() => (null)), ...x);
};
maybe.unary = maybe;
maybe.binary = biMaybe;
maybe.not = curry(biMaybe)(x => x);
maybe.not = function (f,x) {
    return biMaybe((x) => x,f,x);
}
function either(x, a, b) {
    return x ? a : b;
}
module.exports = {
    conditional:conditional,
    maybe:maybe,
    either:either,
    biMaybe:biMaybe
}
