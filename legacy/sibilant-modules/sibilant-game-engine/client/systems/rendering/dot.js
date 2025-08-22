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
    Gl
} = require("../../gl");
var uniforms = Interface.define("uniforms", {
    res: Gl.uniform("Vector2", "Resolution", window.size()),
    scale: Gl.uniform("Float", "Scale", 1)
});
var shaders = Interface.define("shaders", {
    vert: `#version 300 es
  in vec3 a_point;
  in vec4 a_color;
  in float a_size;

  out highp vec4 vColor;

  uniform vec2  u_Resolution;
  uniform float u_Scale;
  vec4 clipspace_coordinate (vec3 xyz, float scale, vec2 res)
  {
    return (vec4(((xyz * vec3(1.0,1.0,1.0) * scale)
                  / vec3(res,1.0) * 1.98 - 0.99), 1.0)
            * vec4( 1.0,-1.0,1.0,1.0 ));

  }
  void main (void)
  {

    float zAxis = a_point[2];
    vec3 p = vec3(a_point);
    p.z = 1.0;

    gl_Position  = clipspace_coordinate( p, u_Scale, u_Resolution );
    gl_PointSize = a_size + zAxis;

    //size * z
    // so that the closer the vertex is (the larger z is), the larger the vertex will be relative to its physical size

    vColor       = a_color;

  }
  `,
    frag: `#version 300 es
  precision mediump float;

  in  vec4 vColor;
  out vec4 FragColor;

  void main(void) {FragColor = vColor;}
  `
});
var vertexLayer = (function vertexLayer$(limit, game) {
    /* vertex-layer eval.sibilant:29:0 */

    return game.rendering.spawn(limit, Vertex, [uniforms.res, uniforms.scale], [shaders.vert, shaders.frag]);
});
var DotInterface = Component.define("DotInterface", {
    color: {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    },
    get pos() {

        return this.system.process.systems.get(Position, this.entity);

    },
    get scale() {

        return this.system.process.systems.get(Physics, this.entity).scale;

    }
});
exports.DotInterface = DotInterface;
var Dot = System.define("Dot", {
    register() {

        return this.verts = vertexLayer(100000, this.game);

    },
    interface: DotInterface,
    spawn(entity) {

        var c = System.spawn.call(this, entity);
        c.vertex = this.verts.spawn();
        return c;

    },
    _updateComponent(dot) {

        dot.vertex.point.x = dot.pos.x + (dot.scale /2);
        dot.vertex.point.y = dot.pos.y + (dot.scale /2);
        dot.vertex.point.z = dot.pos.z ;
        dot.vertex.size = dot.scale;
        dot.vertex.color.r = dot.color.r;
        dot.vertex.color.g = dot.color.g;
        dot.vertex.color.b = dot.color.b;
        return dot.vertex.color.a = dot.color.a;

    }
});
exports.Dot = Dot;
