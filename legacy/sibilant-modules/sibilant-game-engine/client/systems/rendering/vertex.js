var {
    Interface
} = require("kit-interface");
var {
    Andy
} = require("../../gl");
var setColor = (function setColor$(r, g, b, a, vert) {
    /* set-color eval.sibilant:9:0 */

    vert.color.r = r;
    vert.color.g = g;
    vert.color.b = b;
    return vert.color.a = a;
});
var setPoint = (function setPoint$(x, y, z, vert) {
    /* set-point eval.sibilant:16:0 */

    vert.point.x = x;
    vert.point.y = y;
    return vert.point.z = z;
});
var {
    Renderable
} = require("./renderable");
var Vertex = Renderable.define("Vertex", {
    init(layer = this.layer) {

        this.layer = layer;
        return this;

    },
    structure: (new Andy.Gl.Type.Composite({
        point: Andy.Type.Vector3,
        color: Andy.Color.RGBA,
        size: Andy.Type.float
    }))
});
exports.Vertex = Vertex;