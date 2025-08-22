var ScalingVertex = Interface.define("ScalingVertex", {
    init(layer = this.layer) {

        this.layer = layer;
        return this;

    },
    extend: Renderable,
    clear() {

    },
    structure: (new Andy.Gl.Type.Composite({
        point: Andy.Type.Vector3,
        color: Andy.Color.RGBA,
        size: Andy.Type.float
    }))
});