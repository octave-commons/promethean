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
var dl = require("deeplearn"),
    m = require("mathjs");
var running__QUERY = true;
var rgb = (function rgb$(r, g, b) {
    /* rgb eval.sibilant:26:0 */

    return {
        r,
        g,
        b
    };
});
var kernel2d = (function() {
    /* eval.sibilant:27:15 */

    return dl.reshape(dl.tensor2d(arguments[0]), [3, 3, 1, 1]);
});
var _point = (function _point$(x_y$26, i_j$18) {
    /* *point eval.sibilant:29:0 */

    var x = x_y$26[0],
        y = x_y$26[1],
        i = i_j$18[0],
        j = i_j$18[1];

    return [(Math.PI * (x / i) * 2), (Math.PI * (y / j) * 2)];
});
var coordinateGrid = (function coordinateGrid$(i, j) {
    /* coordinate-grid inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        var r = [];
        for (var x = 0; x < i; ++(x)) {
            var r_ = r[x] = [];;
            for (var y = 0; y < j; ++(y)) {
                r_.push(_point([x, y], [i, j]))
            }

        };
        return dl.tensor(r).reshape([1, i, j, 2]);

    }));
});
var pointTensor = (function pointTensor$(x_y$27, i_j$19) {
    /* point-tensor inc/dl.sibilant:3:8 */

    var x = x_y$27[0],
        y = x_y$27[1],
        i = i_j$19[0],
        j = i_j$19[1];

    return dl.tidy((() => {

        return dl.reshape(dl.tensor(_point([x, y], [i, j])).abs().neg(), [1, 1, 1, 2]);

    }));
});
var distanceMatrix = (function distanceMatrix$(p, plane) {
    /* distance-matrix inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return plane.add(p).norm("euclidean", 3);

    }));
});
var inverseSquareMatrix = (function inverseSquareMatrix$(I, c, p, plane) {
    /* inverse-square-matrix inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return I.div(c.add(distanceMatrix(p, plane).square())).abs();

    }));
});
var coords = coordinateGrid(H, W);
var sunPos = {
    x: 0,
    y: 0
};
var p = dl.variable(pointTensor([0, 0], [W, H]));
var state = dl.variable(inverseSquareMatrix(dl.scalar(100), dl.scalar(10), p, coords));
var move = (function move$() {
    /* move inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        sunPos.x = ((sunPos.x + 1) % H);
        sunPos.y = ((sunPos.y + 1) % W);
        return p.assign(pointTensor([sunPos.x, sunPos.y], [W, H]));

    }));
});
var tick = (function tick$() {
    /* tick eval.sibilant:71:0 */

    return dl.nextFrame().then(((nil) => {

        dl.tidy((() => {

            move();
            return state.assign(inverseSquareMatrix(dl.scalar(100), dl.scalar(10), p, coords).mul(dl.randomUniform([1, H, W])));

        }));
        field.render();
        return tick();

    }));
});
state.print();
var field = null;
window.onload = (function window$onload$() {
    /* window.onload eval.sibilant:89:0 */

    var white = rgb(255, 255, 255);
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.height = H;
    canvas.width = W;
    field = colored(canvas, white, [W, H], state);
    tick();
    document.body.style.margin = 0;
    return document.body.style.padding = 0;
});