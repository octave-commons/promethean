var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
    /* euclidian-distance eval.sibilant:1:83 */

    return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var productOf = (function productOf$(a) {
    /* product-of eval.sibilant:6:0 */

    return a.reduce(((value, e) => {

        return (value * e);

    }), 1);
});
var randomUbyte = (function randomUbyte$() {
    /* random-ubyte eval.sibilant:8:0 */

    return (Math.floor((Math.random() * (255 - 0))) + 0);
});
var square = (function square$(dim, f) {
    /* square eval.sibilant:11:0 */

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
    /* inverse-square eval.sibilant:26:0 */

    return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});
var add = (function add$(a, b) {
    /* add eval.sibilant:45:0 */

    return (a + b);
});
var summate = (function summate$(a) {
    /* summate eval.sibilant:46:0 */

    return a.reduce(add, 0);
});