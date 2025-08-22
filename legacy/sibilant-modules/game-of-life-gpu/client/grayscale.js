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
var running__QUERY = true;
var W = window.innerWidth,
    H = window.innerHeight;
var grayscaleImage = randomGrayscale(W, H);
var convert = (function convert$(imgs) {
    /* convert inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return imgs.tile([1, 1, 1, 4]);

    }));
});
async function image(t) {

    var d = await t.data();
    return (new ImageData(Uint8ClampedArray.from(d), t.shape[1], t.shape[2]));

};
var fillWithColor = (function fillWithColor$(color, canvas) {
    /* fill-with-color eval.sibilant:54:0 */

    var ctx = canvas.getContext("2d");
    ctx.globalCompositionOperation = "destination-over";
    ctx.fillStyle = color;
    return ctx.fillRect(0, 0, canvas.width, canvas.height);
});
window.onload = async function onload() {

    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.height = H;
    canvas.width = W;
    canvas.style.backgroundColor = "black";
    var foreground = await image(convert(grayscaleImage));
    var ctx = canvas.getContext("2d");
    return ctx.putImageData(foreground, 0, 0);

};