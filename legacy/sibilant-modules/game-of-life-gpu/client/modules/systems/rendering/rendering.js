var {
    Interface
} = require("kit-interface");
var {
    Layer
} = require("./layer"), {
    PooledSystem
} = require("../../pooling/pooled-system"), {
    Gl
} = require("../../gl"), {
    Scalar
} = require("../../math/scalar");
var bound = (function() {
        /* eval.sibilant:12:11 */

        return arguments[0].bind();
    }),
    clear = (function() {
        /* eval.sibilant:13:11 */

        return arguments[0].clear();
    }),
    rendered = (function() {
        /* eval.sibilant:14:14 */

        return arguments[0].render();
    }),
    unbound = (function() {
        /* eval.sibilant:16:13 */

        return arguments[0].unbind();
    }),
    disabled = (function() {
        /* eval.sibilant:17:14 */

        return arguments[0].disable();
    }),
    enabled = (function() {
        /* eval.sibilant:19:13 */

        return arguments[0].enable();
    });
var Rendering = PooledSystem.define("Rendering", {
    init(dimensions = window.size(), limit = 100, blend = true, context = Gl.context(dimensions, blend), layers = []) {

        this.dimensions = dimensions;
        this.limit = limit;
        this.blend = blend;
        this.context = context;
        this.layers = layers;
        this.interface.context = context;
        this.interface.rendering = this;
        context.gl.enable(context.gl.BLEND);
        context.gl.blendEquation(context.gl.FUNC_ADD);
        context.gl.blendFuncSeparate(context.gl.SRC_ALPHA, context.gl.ONE_MINUS_SRC_ALPHA, context.gl.ONE, context.gl.ONE_MINUS_SRC_ALPHA);
        PooledSystem.init.call(this, limit);
        return this;

    },
    interface: Layer,
    set backgroundColor({
        r,
        g,
        b,
        a
    }) {

        return this.context.makeCurrent().clearColor(...Scalar.div([r, g, b, a], 255));

    },
    resize([width, height] = [this.width, this.height], context = this.context) {

        return context.resize(width, height);

    },
    load({
        dimensions,
        limit,
        blend
    }) {

        return create(Rendering)(dimensions, limit, blend);

    },
    update(layers = this.layers, context = this.context) {

        "render each visible dot to the screen";
        return layers.each(rendered);

    }
});
exports.Rendering = Rendering;