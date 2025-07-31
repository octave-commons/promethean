Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
import { 
  Andy
 } from "./andy.js";
var Gl = {  };
var { 
  Buffer,
  Program,
  Shader,
  Attribute,
  Type,
  Context,
  Uniform
 } = Andy.Gl,
    { 
  BlendMode
 } = Andy.Color;
window.Program = Program;
Gl.shader = (function Gl$shader$(typeName, string, context) {
  /* Gl.shader eval.sibilant:2:319 */

  return (new Andy.Gl.Shader(Andy.Gl.Shader[typeName], string));
});
Gl.buffer = (function Gl$buffer$(_members, context) {
  /* Gl.buffer eval.sibilant:2:429 */

  return (new Andy.Gl.Buffer(context.ARRAY_BUFFER, context.DYNAMIC_DRAW)).bind().data(_members.data).unbind();
});
Gl.context = (function Gl$context$(dimensions, blend) {
  /* Gl.context eval.sibilant:2:609 */

  const context=(new Andy.Context()).makeCurrent().resize(...dimensions).clearColor(0, 0, 0, 0).blend(blend).clear();
  return context;
});
Gl.uniform = (function Gl$uniform$(typeName, varName, value) {
  /* Gl.uniform eval.sibilant:2:919 */

  return (new Andy.Gl.Uniform[typeName](varName, value));
});
Gl.program = (function Gl$program$(vert, frag, context) {
  /* Gl.program eval.sibilant:2:1223 */

  return (new Andy.Gl.Program(Gl.shader("vertex", vert, context), Gl.shader("fragment", frag, context)));
});
export { 
  Gl
 };
export { 
  Andy
 };