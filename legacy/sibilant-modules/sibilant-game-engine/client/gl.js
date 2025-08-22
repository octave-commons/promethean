var Andy = require("./andy"),
    utils = require("./utils");
var Gl = {};
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
global.Program = Program;
Gl.shader = (function Gl$shader$(typeName, string, context) {
    /* Gl.shader eval.sibilant:14:0 */

    return (new Andy.Gl.Shader(Andy.Gl.Shader[typeName], string));
});
Gl.buffer = (function Gl$buffer$(_members, context) {
    /* Gl.buffer eval.sibilant:18:0 */

    return (new Andy.Gl.Buffer(context.ARRAY_BUFFER, context.DYNAMIC_DRAW)).bind().data(_members.data).unbind();
});
Gl.context = (function Gl$context$(dimensions, blend) {
    /* Gl.context eval.sibilant:24:0 */

    return (new Andy.Context()).makeCurrent().resize(...dimensions).clearColor(0, 0, 0, 0).blend(blend).clear();
});
Gl.uniform = (function Gl$uniform$(typeName, varName, value) {
    /* Gl.uniform eval.sibilant:32:0 */

    return (new Andy.Gl.Uniform[typeName](varName, value));
});
Gl.program = (function Gl$program$(vert, frag, context) {
    /* Gl.program eval.sibilant:42:0 */

    return (new Andy.Gl.Program(Gl.shader("vertex", vert, context), Gl.shader("fragment", frag, context)));
});
exports.Gl = Gl;
exports.Andy = Andy;