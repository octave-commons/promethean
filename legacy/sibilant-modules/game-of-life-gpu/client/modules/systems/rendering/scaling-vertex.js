var {
    Interface
} = require("kit-interface");
var {
    Renderable
} = require("./renderable"), {
    Andy
} = require("../../gl");
var ScalingVertex = Renderable.define("ScalingVertex", {
    init(layer = this.layer) {

        this.layer = layer;
        return this;

    },
    clear() {

    },
    structure: (new Andy.Gl.Type.Composite({
        point: Andy.Type.Vector3,
        color: Andy.Color.RGBA,
        size: Andy.Type.float
    }))
});