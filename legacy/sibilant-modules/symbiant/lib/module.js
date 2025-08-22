const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  File,
  Directory,
  Inode
 } = require("./file-system");
const { 
  Future,
  Array:Arr
 } = require("./async");
const { 
  Javascript
 } = require("./javascript");
const { 
  Sibilant
 } = require("./sibilant");
var deepFlatten = (function deepFlatten$(arr) {
  /* deep-flatten lib/module.sibilant:22:0 */

  "Resolve an array of strings, create an array which is the\n" +
  "interleaving of the joins of all sub arrays recursively.\n" +
  "All other values are simply inserted.";
  return Arr.resolve(arr).bind(cond(is.array, deepFlatten, (x) => {
  	
    return [ x ];
  
  }));
});
var concatString = (function concatString$(args) {
  /* concat-string lib/module.sibilant:30:0 */

  "Resolve an array of strings, return a promise for the concatonation of\n" +
  "all values contained with in the array.";
  return Arr.resolve(args).reduce((result, element) => {
  	
    return (result + element);
  
  }, "");
});
const Module = { 
  symbol:Symbol("Module"),
  init( source = this.source,here = this.here,js = this.js,exports = this.exports,varNames = this.varNames,context = this.context ){ 
    
      this.source = source;this.here = here;this.js = js;this.exports = exports;this.varNames = varNames;this.context = context;
      return this;
    
   },
  compile( source = this.source,varNames = [ "foo", "bar", "bazzle" ],self = this ){ 
    
      "create a function from the string which was given to the module at its creation.\n" +
      "The string should be valid javascript";
      return self.js = create(Javascript)(concatString(deepFlatten([ "(function (exports, here,context) {\n", "\"use strict\";\n", (function() {
        if (!(0 === varNames.length)) {
          return [ "let { ", varNames.join(","), " } = context;\n" ].join("");
        } else {
          return "";
        }
      }).call(this), source.string, ";\n", "return exports;\n", "})" ])));
    
   },
  load( here = this.here,js = this.js,exports = {  },context = {  },self = this ){ 
    
      "compile string to javascript if it is not compiled already, and apply the function returned by the module.\n" +
      "Also builds the scope";
      context = extend(context, { 
        Module,
        Javascript,
        Sibilant,
        Directory,
        File,
        Inode,
        Future,
        Arr
       });
      return this.module = ap((function() {
        if (!(js)) {
          return self.compile().eval();
        } else {
          return js.eval();
        }
      }).call(this), exports, here, context);
    
   }
 };
exports.Module = Module;