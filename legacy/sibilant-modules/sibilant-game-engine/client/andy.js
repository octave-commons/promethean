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