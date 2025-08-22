require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/aaron/devel/apps/game-of-life/client/modules/math/math.js":[function(require,module,exports){
var tau = (Math.PI * 2);
exports.tau = tau;
var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
    /* euclidian-distance eval.sibilant:26:0 */

    return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var productOf = (function productOf$(a) {
    /* product-of eval.sibilant:31:0 */

    return a.reduce(((value, e) => {

        return (value * e);

    }), 1);
});
exports.productOf = productOf;
var randomUbyte = (function randomUbyte$() {
    /* random-ubyte eval.sibilant:34:0 */

    return (Math.floor((Math.random() * (255 - 0))) + 0);
});
exports.randomUbyte = randomUbyte;
var square = (function square$(dim, f) {
    /* square eval.sibilant:37:0 */

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
exports.square = square;
var inverseSquare = (function inverseSquare$(rate, c, pos, {
    x,
    y
}) {
    /* inverse-square eval.sibilant:46:0 */

    return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});
exports.inverseSquare = inverseSquare;
var add = (function add$(a, b) {
    /* add eval.sibilant:50:0 */

    return (a + b);
});
exports.add = add;
var summate = (function summate$(a) {
    /* summate eval.sibilant:53:0 */

    return a.reduce(add, 0);
});
exports.summate = summate;
},{}]},{},[]);
