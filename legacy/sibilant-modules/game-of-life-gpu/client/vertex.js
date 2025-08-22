var setColor = (function setColor$(r, g, b, a, vert) {
    /* set-color eval.sibilant:2:0 */

    vert.color.r = r;
    vert.color.g = g;
    vert.color.b = b;
    return vert.color.a = a;
});
var setPoint = (function setPoint$(x, y, z, vert) {
    /* set-point eval.sibilant:9:0 */

    vert.point.x = x;
    vert.point.y = y;
    return vert.point.z = z;
});
var Vertex = Interface.define("Vertex", {
    init(layer = this.layer) {

        this.layer = layer;
        return this;

    },
    extend: Renderable,
    structure: (new Andy.Gl.Type.Composite({
        point: Andy.Type.Vector3,
        color: Andy.Color.RGBA,
        size: Andy.Type.float
    }))
});