(function(a, b, c) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);





;
var R = require("ramda");
var {
    create,
    extend,
    mixin,
    conditional,
    cond,
    partiallyApplyAfter
} = require("kit/js/util");
var {
    Interface
} = require("kit-interface");;
Array.prototype.each = (function Array$prototype$each$(f) {
    /* Array.prototype.each inc/misc.sibilant:1:0 */

    this.forEach(f);
    return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each inc/misc.sibilant:4:0 */

    return Object.keys(this).forEach(((k) => {

        return f(this[k], k);

    }));
});
var {
    Tree,
    TreeMap
} = require("tree-kit");
var dl = require("deeplearn"),
    m = require("mathjs");
var exports = {};
var tau = (Math.PI * 2);
var W = window.innerWidth,
    H = window.innerHeight;
var rgb = (function rgb$(r, g, b) {
    /* rgb eval.sibilant:77:0 */

    return {
        r,
        g,
        b
    };
});
var memoize = (function memoize$(f) {
    /* memoize eval.sibilant:81:0 */

    "create a memoized version of any function. A memoized function will return\n" + "previously calculated results from a cache if the arguments given to it are the same";
    var m = {};
    return cond(R.has, R.prop, ((...args) => {

        return f.apply(this, args);

    }));
});
var setValue = R.curry(((value, entity) => {

    return entity.value = value;

}));
var {
    not: fnot,
    pipe: fpipe,
    equals
} = R;
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each eval.sibilant:95:0 */

    return Object.keys(this).each(((k) => {

        return f(this[k], k);

    }));
});
var {
    Matrix,
    MatrixView,
    Kernel
} = require("kit/js/matrix");
var matrix = create(Matrix);
var kernel = create(Kernel);
var matrixView = create(MatrixView);
var treeMap = create(TreeMap);
var events = require("events");
window.global = window;
EventEmitter.removeAllListeners = (function EventEmitter$removeAllListeners$(...args) {
    /* Event-emitter.remove-all-listeners eval.sibilant:109:0 */

    return events.EventEmitter.prototype.removeAllListeners.call(this, ...args);
});
var curry = R.curry;
var fmap = R.curry(((f, a) => {

    return a.map(f);

}));
var fset = R.curry(((o, k, v) => {

    return o[k] = v;

}));
window.size = (function window$size$() {
    /* window.size eval.sibilant:120:0 */

    return [window.innerWidth, window.innerHeight];
});
var search = R.curry(((value, array) => {

    return array.find(((v) => {

        return v === value;

    }));

}));
var identity = (function identity$(a) {
    /* identity eval.sibilant:124:0 */

    return a;
});
var searchIfGiven = (function searchIfGiven$(array, value) {
    /* search-if-given eval.sibilant:126:0 */

    return conditional(array, (() => {

        return typeof value !== "undefined";

    }), search(value), identity);
});
var fprint = (function fprint$($value, ...args) {
    /* fprint eval.sibilant:133:0 */

    console.log($value, ...args);
    return $value;
});
var feach = R.curry(((f, a) => {

    return a.each(f);

}));