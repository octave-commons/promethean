var R = require("ramda");
var {
    create,
    extend,
    mixin,
    conditional,
    cond,
    partiallyApplyAfter
} = require("kit/js/util");;
Array.prototype.each = (function Array$prototype$each$(f) {
    /* Array.prototype.each inc/misc.sibilant:39:0 */

    this.forEach(f);
    return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each inc/misc.sibilant:42:0 */

    return Object.keys(this).forEach(((k) => {

        return f(this[k], k);

    }));
});
var m = require("mathjs"),
    {
        EventEmitter
    } = require("kit-events"),
    events = require("events");
EventEmitter.removeAllListeners = (function EventEmitter$removeAllListeners$(...args) {
    /* Event-emitter.remove-all-listeners eval.sibilant:16:0 */

    return events.EventEmitter.prototype.removeAllListeners.call(this, ...args);
});
var rgb = (function rgb$(r, g, b) {
    /* rgb eval.sibilant:22:0 */

    return {
        r,
        g,
        b
    };
});
exports.rgb = rgb;
var memoize = (function memoize$(f) {
    /* memoize eval.sibilant:25:0 */

    "create a memoized version of any function. A memoized function will return\n" + "previously calculated results from a cache if the arguments given to it are the same";
    var m = {};
    return cond(R.has, R.prop, ((...args) => {

        return f.apply(this, args);

    }));
});
exports.memoize = memoize;
var setValue = R.curry(((value, entity) => {

    return entity.value = value;

}));
exports.setValue = setValue;
var {
    not: fnot,
    pipe: fpipe,
    equals
} = R;
exports.fnot = fnot;
exports.fpipe = fpipe;
exports.equals = equals;
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each eval.sibilant:43:0 */

    return Object.keys(this).each(((k) => {

        return f(this[k], k);

    }));
});
var curry = R.curry;
exports.curry = curry;
var fmap = R.curry(((f, a) => {

    return a.map(f);

}));
exports.fmap = fmap;
var fset = R.curry(((o, k, v) => {

    return o[k] = v;

}));
exports.fset = fset;
window.size = (function window$size$() {
    /* window.size eval.sibilant:59:0 */

    return [window.innerWidth, window.innerHeight];
});
var search = R.curry(((value, array) => {

    return array.find(((v) => {

        return v === value;

    }));

}));
exports.search = search;
var identity = (function identity$(a) {
    /* identity eval.sibilant:64:0 */

    return a;
});
exports.identity = identity;
var searchIfGiven = (function searchIfGiven$(array, value) {
    /* search-if-given eval.sibilant:67:0 */

    return conditional(array, (() => {

        return typeof value !== "undefined";

    }), search(value), identity);
});
exports.searchIfGiven = searchIfGiven;
var fprint = (function fprint$($value, ...args) {
    /* fprint eval.sibilant:75:0 */

    console.log($value, ...args);
    return $value;
});
exports.fprint = fprint;
var feach = R.curry(((f, a) => {

    return a.each(f);

}));
exports.feach = feach;