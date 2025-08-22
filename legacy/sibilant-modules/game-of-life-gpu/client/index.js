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
window.onload = (function window$onload$() {
    /* window.onload eval.sibilant:4:0 */

    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    var W = 800,
        H = 800;
    canvas.height = H;
    canvas.width = W;
    var rgb = (function rgb$(r, g, b) {
        /* rgb eval.sibilant:20:5 */

        return {
            r,
            g,
            b
        };
    });
    var kernel = dl.reshape(dl.tensor2d([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]), [3, 3, 1, 1]);
    var state0Tensor = dl.randomUniform([H, W]).greater(dl.scalar(0.5, "float32"));
    var state = dl.variable(dl.cast(dl.reshape(state0Tensor, [1, H, W, 1]), "float32"));
    var running__QUERY = true;
    var step = (function step$() {
        /* step eval.sibilant:35:5 */

        return state.assign(dl.tidy((() => {

            var neighbors = dl.conv2d(state, kernel, [1, 1, 1, 1], "same");
            var survive = dl.logicalAnd(dl.equal(state, dl.scalar(1, "float32")), dl.equal(neighbors, dl.scalar(2, "float32"))),
                born = dl.equal(neighbors, dl.scalar(3, "float32"));
            return dl.cast(dl.logicalOr(survive, born), "float32");

        })));
    });
    var black = rgb(0, 0, 0);
    var red = rgb(255, 0, 0);
    var gameField = colored(red, [H, W], state);
    var start = (function start$() {
        /* start eval.sibilant:52:5 */

        return dl.nextFrame().then((() => {

            if (!(running__QUERY)) {
                return false;
            };
            step();
            gameField.render(canvas);
            return start();

        }));
    });
    return start();
});
