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
} = require("kit-interface");
var imageify = (function imageify$(state) {
    /* imageify inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return reshape.state([(H * W)]);

    }));
});
var grayscaleToRgba = (function grayscaleToRgba$(images) {
    /* grayscale-to-rgba inc/dl.sibilant:3:8 */

    return dl.tidy((() => {

        return images.concat();

    }));
});
var Field = Interface.define("Field", {
    init(canvas = this.canvas, shape = [0, 0], state = dl.ones(shape), imageData = (new ImageData(shape[0], shape[1])), ctx = canvas.getContext("2d")) {

        this.canvas = canvas;
        this.shape = shape;
        this.state = state;
        this.imageData = imageData;
        this.ctx = ctx;
        return this;

    },
    render(canvas = this.canvas, state = this.state, shape = this.shape, imageData = this.imageData, ctx = this.ctx) {

        if (!(running__QUERY)) {
            return false;
        };
        var height = shape[0],
            width = shape[1];
        return state.data().then(((d) => {

            var j = 0,
                k = 0;
            for (var i = 0; i < (width * height); ++(i)) {
                j = (i * 4);;
                this._renderCell(d[i], j, imageData)
            };
            return ctx.putImageData(imageData, 0, 0);

        }));

    }
});
var Colored = Field.define("Colored", {
    init(canvas = this.canvas, color = this.color, shape = this.shape, state = this.state) {

        this.canvas = canvas;
        this.color = color;
        this.shape = shape;
        this.state = state;
        Field.init.call(this, canvas, shape, state);
        return this;

    },
    _renderCell(a, j, imageData) {

        a = Math.min(1, Math.pow(a, 2));
        imageData.data[j] = Math.round((this.color.r * a));
        imageData.data[(j + 1)] = Math.round((this.color.g * a));
        imageData.data[(j + 2)] = Math.round((this.color.b * a));
        return imageData.data[(j + 3)] = 255;

    }
});
var colored = create(Colored);