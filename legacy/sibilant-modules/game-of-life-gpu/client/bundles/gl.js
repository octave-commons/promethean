require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Andy = require("webgl");
var Gl = Andy.gl,
    Color = Andy.Color;
Color.RGBA = Gl.Type.RGBA;
var ubyte = Gl.Type.ubyte,
    Type = Gl.Type;
Andy.ubyte = ubyte;
Andy.Type = Type;
Andy.Gl = Andy.gl;
Andy.Color.RGBA = Type.RGBA;
mixin([Andy.Gl, Andy.Color], Andy);
var {
    Buffer,
    Program,
    Shader,
    Attribute,
    Type,
    Context,
    Uniform
} = Gl, {
    BlendMode
} = Color;
module.exports = Andy;
},{"webgl":undefined}],"/home/aaron/devel/apps/game-of-life/client/modules/gl.js":[function(require,module,exports){
var Andy = require("./andy");
var {
    Buffer,
    Program,
    Shader,
    Attribute,
    Type,
    Context,
    Uniform
} = Andy.Gl, {
    BlendMode
} = Andy.Color;
Gl.shader = (function Gl$shader$(typeName, string, context) {
    /* Gl.shader eval.sibilant:8:0 */

    return (new Andy.Gl.Shader(Andy.Gl.Shader[typeName], string));
});
Gl.buffer = (function Gl$buffer$(_members, context) {
    /* Gl.buffer eval.sibilant:11:0 */

    return (new Andy.Gl.Buffer(context.ARRAY_BUFFER, context.DYNAMIC_DRAW)).bind().data(_members.data).unbind();
});
Gl.context = (function Gl$context$(dimensions, blend) {
    /* Gl.context eval.sibilant:17:0 */

    return (new Andy.Context()).makeCurrent().resize(...dimensions).clearColor(0, 0, 0, 0).blend(blend).clear();
});
Gl.uniform = (function Gl$uniform$(typeName, varName, value) {
    /* Gl.uniform eval.sibilant:25:0 */

    return (new Andy.Gl.Uniform[typeName](varName, value));
});
var uniforms = {
    res: Gl.uniform("Vector2", "Resolution", window.size()),
    scale: Gl.uniform("Float", "Scale", 1)
};
exports.uniforms = uniforms;
Gl.program = (function Gl$program$(vert, frag, context) {
    /* Gl.program eval.sibilant:38:0 */

    return (new Andy.Gl.Program(Gl.shader("vertex", vert, context), Gl.shader("fragment", frag, context)));
});
var defGlsl = (function defGlsl$(outType, name, inTypes, ...body) {
    /* def-glsl eval.sibilant:43:0 */

    return (function(shader) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        return shader;
    })([outType, name, "(", inTypes.join(","), ")", "{\n", ...body, "}"].join(" "));
});
var vertShader = (function vertShader$() {
    /* vert-shader eval.sibilant:50:0 */

    return ("#version 300 es\n" + "in vec3 a_point;\n" + "in vec4 a_color;\n" + "in float a_size;\n" + "\n" + "out highp vec4 vColor;\n" + "\n" + "uniform vec2  u_Resolution;\n" + "uniform float u_Scale;" + defGlsl("vec4", "clipspace_coordinate", ["vec3 xyz", "float scale", "vec2 res"], "return vec4( (xyz * vec3(1.0,1.0,1.0) * scale) /", "(vec3(res,1.0)) * 1.98 - 0.99, 1.0) * vec4( 1.0,-1.0,1.0,1.0 ); ") + defGlsl("void", "main", ["void"], ("gl_Position  = clipspace_coordinate( a_point, u_Scale, u_Resolution );\n" + "              gl_PointSize = a_size;\n" + "//size * z\n" + "// so that the closer the vertex is (the larger z is), the larger the vertex will be relative to its physical size\n" + "\n" + "\n" + "              vColor       = a_color; ")));
});
var fragmentShaderString = ("#version 300 es\n" + "precision mediump float;\n" + "\n" + "in  vec4 vColor;\n" + "out vec4 FragColor;\n" + "\n" + "void main(void)\n" + "{\n" + " FragColor = vColor;\n" + "           }");
exports.vertShader = vertShader;
exports.fragmentShaderString = fragmentShaderString;
exports.Gl = Gl;
exports.Andy = Andy;
},{"./andy":1}]},{},[]);
