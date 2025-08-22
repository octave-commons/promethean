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
var curry = R.curry;
import { 
  Compiler
 } from "./compiler.js";
import { 
  Reader
 } from "./reader.js";
import { 
  Evaluator
 } from "./evaluator.js";
import { 
  Layer
 } from "./layer.js";
var REPL = Layer.of([ Reader, Compiler, Evaluator ]).define("REPL", { 
  init(  ){ 
    
      
      Layer.init.call(this);
      this.on("message", (([ type, value ]) => {
      	return this.emit(type, value);
      }));
      return this;
    
   }
 });
exports.REPL = REPL;
exports.Compiler = Compiler;
exports.Reader = Reader;
exports.Evaluator = Evaluator;
exports.Layer = Layer;