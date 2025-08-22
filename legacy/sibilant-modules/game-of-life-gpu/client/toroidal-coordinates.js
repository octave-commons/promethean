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
var dl = require("deeplearn"),
    m = require("mathjs");
var zero = dl.scalar(0);
var field = (function field$(w_h$7) {
    /* field inc/dl.sibilant:3:8 */

    var w = w_h$7[0],
        h = w_h$7[1];

    return dl.tidy((() => {

        return dl.cast(dl.zeros([1, w, h, 1]), "float32");

    }));
});
var bitField = (function bitField$(t) {
    /* bit-field inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return t.greater(dl.scalar(0.5, "float32"));

    }));
});
var randomBitField = (function randomBitField$(w, h) {
    /* random-bit-field inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return bitField(dl.randomUniform([w, h]));

    }));
});
var rotate = (function rotate$(t, theta) {
    /* rotate inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return t.matMul(dl.tensor2d([
            [Math.cos(theta), (-1 * Math.sin(theta))],
            [Math.sin(theta), Math.cos(theta)]
        ]));

    }));
});
var norm = (function norm$(t, n) {
    /* norm inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return t.norm("euclidean", n);

    }));
});
var modTensor = (function modTensor$(t, m) {
    /* mod-tensor inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        var q = t.div(m);
        var r = q.sub(dl.where(dl.greater(q, dl.scalar(0)), q.floor(), q.ceil()));
        return r.mul(m);

    }));
});
var coordinateGrid = (function coordinateGrid$(j_i$7, _point) {
    /* coordinate-grid inc/dl.sibilant:3:8 */

    var j = j_i$7[0],
        i = j_i$7[1];

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
var pointTensor = (function pointTensor$(x_y$7, i_j$7, _point) {
    /* point-tensor inc/dl.sibilant:3:8 */

    var x = x_y$7[0],
        y = x_y$7[1],
        i = i_j$7[0],
        j = i_j$7[1];

    return dl.tidy((() => {

        return dl.tensor(_point([x, y], [i, j]));

    }));
});
var distanceMatrix = (function distanceMatrix$(p, plane, _point) {
    /* distance-matrix inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return plane.add(p).norm("euclidean", 3);

    }));
});
var inverseSquareMatrix = (function inverseSquareMatrix$(I, c, p, plane, _point) {
    /* inverse-square-matrix inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return I.div(c.add(distanceMatrix(p, plane, _point).square()));

    }));
});
var coordTypes = Interface.define("coordTypes", {
    toroid([x, y], [i, j]) {

        var theta = ((x / i) * tau),
            phi = ((y / j) * tau),
            u = (m.cos(theta) * m.sin(theta)),
            v = (m.sin(phi) * m.cos(phi)),
            c = 1,
            a = 1;
        return [((c + (a * m.sin(phi))) * m.cos(theta)), ((c + (a * m.cos(phi))) * m.sin(theta))];

    },
    cartesian([x, y], [i, j]) {

        return [(((x - 1) % i) / i), (((y - 1) % j) / j)];

    }
});
var CoordinateSystem = Interface.define("CoordinateSystem", {
    init(dim = this.dim, plane = this.grid(dim)) {

        this.dim = dim;
        this.plane = plane;
        return this;

    },
    distances(p = this.p, plane = this.plane, _type = this._type) {

        return distanceMatrix(p, plane, _type);

    },
    inverseSquare(I = this.I, c = this.c, p = this.p, plane = this.plane, _type = this._type) {

        return inverseSquareMatrix(I, c, p, plane, _type);

    },
    grid(dim = this.dim, _type = this._type) {

        return coordinateGrid(dim, _type);

    },
    point(p = this.p, dim = this.dim, _type = this._type) {

        return pointTensor(p, dim, _type);

    }
});
var Toroid = CoordinateSystem.define("Toroid", {
    _type: coordTypes.toroid
});
var Cartesian = CoordinateSystem.define("Cartesian", {
    _type: coordTypes.cartesian
});
var rgb = (function rgb$(r, g, b) {
    /* rgb src/client/modules/tensors/image.sibilant:4:0 */

    return {
        r,
        g,
        b
    };
});
var createGrayscaleImage = (function createGrayscaleImage$(t) {
    /* create-grayscale-image inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return field(t).mul(dl.scalar(255, "float32"));

    }));
});
var randomGrayscale = (function randomGrayscale$(w, h) {
    /* random-grayscale inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return createGrayscaleImage(bitField(w, h));

    }));
});
var grayscaleToRgba = (function grayscaleToRgba$(imgs) {
    /* grayscale-to-rgba inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return imgs.tile([1, 1, 1, 4]);

    }));
});
var grayscaleToRgb = (function grayscaleToRgb$(imgs) {
    /* grayscale-to-rgb inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return imgs.tile([1, 1, 1, 3]);

    }));
});
var uint8c = (function uint8c$(arr) {
    /* uint8c src/client/modules/tensors/image.sibilant:11:0 */

    return Uint8ClampedArray.from(arr);
});
async function image(t) {

    return (new ImageData(uint8c(await t.data()), t.shape[1], t.shape[2]));

};
var tau = (Math.PI * 2);
var W = window.innerWidth,
    H = window.innerHeight;
var running__QUERY = true;
var dim = [W, H];
var coords = create(Toroid)(dim);
var sunPos = {
    x: (W / 2),
    y: (H / 2)
};
var p = dl.variable(coords.point([0, 0]));
var I = dl.scalar(0.9),
    c = dl.scalar(1);
var state = dl.variable(coords.inverseSquare(I, c, p));
var calculateState = (function calculateState$() {
    /* calculate-state eval.sibilant:31:0 */

    return coords.inverseSquare(I, c, p);
});
var move = (function move$() {
    /* move inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        sunPos.x = (sunPos.x - 1);
        sunPos.y = (sunPos.y - 1);
        return p.assign(coords.point([sunPos.x, sunPos.y]));

    }));
});
var tick = (function() {
    /* eval.sibilant:39:10 */

    return dl.nextFrame(arguments[0]).then(((nil) => {

        dl.tidy(((keep) => {

            move();
            return state.assign(calculateState());

        }));
        console.log("tick");
        field.render();
        return tick();

    }));
});
state.print();
var field = null;
window.onload = (function window$onload$() {
    /* window.onload eval.sibilant:47:0 */

    var white = rgb(255, 255, 255);
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.height = H;
    canvas.width = W;
    field = colored(canvas, white, dim, state);
    tick();
    document.body.style.margin = 0;
    return document.body.style.padding = 0;
});