var {
    Interface
} = require("kit-interface");
var {
    Component,
    System
} = require("../../ecs/component"), {
    Physics
} = require("../physics"), {
    Vertex
} = require("./vertex"), {
    Position
} = require("../position"), {
    uniforms,
    vertShader,
    fragmentShaderString
} = require("../../gl");
var vertexLayer = (function vertexLayer$(limit, game) {
    /* vertex-layer eval.sibilant:14:0 */

    return game.rendering.spawn(limit, Vertex, [uniforms.res, uniforms.scale], [vertShader(), fragmentShaderString]);
});
var DotInterface = Component.define("DotInterface", {
    get color() {

        return this.data;

    },
    get pos() {

        return this.system.process.systems.get(Position, this.entity);

    },
    get scale() {

        return this.system.process.systems.get(Physics, this.entity).scale;

    },
    get vertex() {

        return this.data.vertex;

    }
});
exports.DotInterface = DotInterface;
var Dot = System.define("Dot", {
    register() {

        return this.verts = vertexLayer(100000, this.game);

    },
    interface: DotInterface,
    spawn(entity, data) {

        data.vertex = this.verts.spawn();
        var c = System.spawn.call(this, entity, data);
        return c;

    },
    _updateComponent(dot) {

        dot.vertex.point.x = dot.pos.x;
        dot.vertex.point.y = dot.pos.y;
        dot.vertex.point.z = 0;
        dot.vertex.size = dot.scale;
        dot.vertex.color.r = dot.color.r;
        dot.vertex.color.g = dot.color.g;
        dot.vertex.color.b = dot.color.b;
        return dot.vertex.color.a = dot.color.a;

    }
});
exports.Dot = Dot;