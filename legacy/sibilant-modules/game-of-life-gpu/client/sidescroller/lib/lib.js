Array.transform = (function Array$transform$(f, a, r = a) {
    /* Array.transform src/client/sidescroller/lib/natives/array.sibilant:1:0 */

    return (function(r) {
        /* src/client/sidescroller/systems/components/sprite.sibilant:12:15 */

        a.each(((e, i) => {

            return r[i] = f(e, i);

        }));
        return r;
    }).call(this, r);
});
Array.prototype.bind = Array.bind = (function Array$bind$(a, f) {
    /* Array.bind src/client/sidescroller/lib/natives/array.sibilant:5:8 */

    return a.reduce(((r, e, i) => {

        f(e, i).each(((x) => {

            return r.push(x);

        }));
        return r;

    }), []);
});
Array.prototype.each = (function Array$prototype$each$(f) {
    /* Array.prototype.each src/client/sidescroller/lib/natives/array.sibilant:19:0 */

    this.forEach(f);
    return this;
});
Array.prototype.bind = (function Array$prototype$bind$(f) {
    /* Array.prototype.bind src/client/sidescroller/lib/natives/array.sibilant:22:0 */

    return (function(r) {
        /* src/client/sidescroller/systems/components/sprite.sibilant:12:15 */

        this.each(((a) => {

            return r.push(f(a));

        }));
        return r;
    }).call(this, []);
});
Map.prototype.each = (function Map$prototype$each$(f) {
    /* Map.prototype.each src/client/sidescroller/lib/natives/map.sibilant:1:0 */

    this.forEach(f);
    return this;
});
var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
    /* euclidian-distance src/client/sidescroller/lib/math/geometry.sibilant:1:0 */

    return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var square = (function square$(dim, f) {
    /* square src/client/sidescroller/lib/math/geometry.sibilant:6:0 */

    var lim = Math.round((dim / 2));
    (function() {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

        var $for = null;
        for (var i = (0 - lim); i <= lim; ++(i)) {
            $for = (function() {
                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                return (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

                    var $for = null;
                    for (var j = (0 - lim); j <= lim; ++(j)) {
                        $for = (function() {
                            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                            return f(i, j);
                        }).call(this);
                    };
                    return $for;
                }).call(this);
            }).call(this);
        };
        return $for;
    }).call(this);
    return null;
});
var inverseSquare = (function inverseSquare$(rate, c, pos, {
    x,
    y
}) {
    /* inverse-square src/client/sidescroller/lib/math/geometry.sibilant:21:0 */

    return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});;
var add = (function add$(a, b) {
    /* add src/client/sidescroller/lib/math.sibilant:7:0 */

    return (a + b);
});
var summate = (function summate$(a) {
    /* summate src/client/sidescroller/lib/math.sibilant:8:0 */

    return a.reduce(add, 0);
});
console.log("math done");
var {
    Matrix,
    MatrixView,
    Kernel
} = require("kit/js/matrix");
var matrix = create(Matrix);
var kernel = create(Kernel);
var matrixView = create(MatrixView);
var treeMap = create(TreeMap);
var setValue = R.curry(((value, entity) => {

    return entity.value = value;

}));
var curry = R.curry;
var {
    not: fnot,
    pipe: fpipe,
    equals
} = R;
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each eval.sibilant:27:0 */

    return Object.keys(this).each(((k) => {

        return f(this[k], k);

    }));
});
global.create = create;
global.extend = extend;
global.mixin = mixin;
var green = {
        red: 0,
        green: 255,
        blue: 0
    },
    yellow = {
        red: 255,
        green: 255,
        blue: 0
    };
var memoize = (function memoize$(f) {
    /* memoize eval.sibilant:38:0 */

    "create a memoized version of any function. A memoized function will return\n" + "previously calculated results from a cache if the arguments given to it are the same";
    var m = {};
    return cond(R.has, R.prop, ((...args) => {

        return f.apply(this, args);

    }));
});