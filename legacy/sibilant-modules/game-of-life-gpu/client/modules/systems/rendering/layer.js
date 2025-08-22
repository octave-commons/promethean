var {
    Interface
} = require("kit-interface");
var {
    ObjectPool
} = require("../../pooling/object-pool"), {
    PooledSystem
} = require("../../pooling/pooled-system"), {
    Renderable
} = require("./renderable"), {
    Gl
} = require("../../gl");
var bound = (function() {
        /* eval.sibilant:9:11 */

        return arguments[0].bind();
    }),
    clear = (function() {
        /* eval.sibilant:10:11 */

        return arguments[0].clear();
    }),
    rendered = (function() {
        /* eval.sibilant:11:14 */

        return arguments[0].render();
    }),
    unbound = (function() {
        /* eval.sibilant:13:13 */

        return arguments[0].unbind();
    }),
    disabled = (function() {
        /* eval.sibilant:14:14 */

        return arguments[0].disable();
    }),
    enabled = (function() {
        /* eval.sibilant:16:13 */

        return arguments[0].enable();
    });
var Layer = PooledSystem.define("Layer", {
    init(limit = this.limit, interface = Renderable, uniform = [], shaders = [], context = this.context, program = Gl.program(shaders[0], shaders[1], context), _members = interface.structure.Array(limit), buffer = Gl.buffer(_members, context)) {

        this.limit = limit;
        this.interface = interface;
        this.uniform = uniform;
        this.shaders = shaders;
        this.context = context;
        this.program = program;
        this._members = _members;
        this.buffer = buffer;
        console.log("creating layer", _members);
        PooledSystem.init.call(this, limit, interface, create(ObjectPool)(limit, interface, _members));
        this.rendering.layers.push(this);
        return this;

    },
    spawn() {

        return this._pool.aquire();

    },
    despawn(o) {

        return this._pool.release(o);

    },
    clear(buffer = this.buffer, _members = this._members, context = this.context) {

        return buffer.bind().data(_members.data).unbind();

    },
    enable(buffer = this.buffer, uniform = this.uniform, program = this.program, context = this.context) {

        buffer.bind();
        program.enable();
        uniform.each(enabled);
        return this.interface.structure.enableGlAttributes();

    },
    disable(buffer = this.buffer, uniform = this.uniform, program = this.program) {

        program.disable();
        return buffer.unbind();

    },
    draw(context = this.context) {

        return (function() {
            if (!(this._pool.used === 0)) {
                return context.draw(context.POINTS, (this._pool.size - this._pool.used), this._pool.used);
            }
        }).call(this);

    },
    render() {

        this.clear();
        this.enable();
        this.draw();
        return this.disable();

    }
});
exports.Layer = Layer;