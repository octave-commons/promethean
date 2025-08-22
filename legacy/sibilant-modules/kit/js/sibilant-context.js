

(function(a, b, c) {
  /* inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var vm = require("vm"),
    sibilant = require("sibilant");
var createContext = (function createContext$(obj = {  }) {
  /* create-context inc/core/function-expressions.sibilant:30:8 */

  var context = vm.createContext({  }, "name");
  context._sibilant = sibilant;
  context.module = module;
  context.require = require;
  context.context = context;
  Object.keys(global).forEach((function(key) {
    /* inc/vm.sibilant:10:2 */
  
    return context[key] = global[key];
  }));
  Object.keys(obj).forEach((function(key) {
    /* inc/vm.sibilant:11:2 */
  
    return context[key] = obj[key];
  }));
  return context;
});
var sibilant = require("sibilant"),
    vm = require("vm"),
    fs = require("fs"),
    { 
  create,
  extend,
  partiallyApplyAfter,
  mixin
 } = require("../js/util"),
    { 
  plift
 } = require("./promise");
exports.createContext = createContext;
var transpileSibilant = fpipe(sibilant(sibilantString), "js"),
    readFile = plift(fs.readFile),
    context = createContext();
exports.transpileSibilant = transpileSibilant;
var evalFile = (function evalFile$(path = this.path, _context = this._context, name = this.name) {
  /* eval-file inc/core/function-expressions.sibilant:23:8 */

  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    console.log("path", path);
    return readFile(path, "utf8").then(partiallyApplyAfter(evalString, name));
  
  })));
});
var evalString = (function evalString$(sibilantString = this.sibilantString, _context = this._context, name = this.name) {
  /* eval-string inc/core/function-expressions.sibilant:30:8 */

  return vm.runInContext(_context, name);
});
var evalStream = (function evalStream$() {
  /* eval-stream inc/core/function-expressions.sibilant:30:8 */

  
});
const SibilantContext={ 
  symbol:Symbol("SibilantContext"),
  init( _context = createContext() ){ 
    
      this._context = _context;
      return this;
    
   },
  name:"kit",
  _context:context,
  _sibilant:sibilant,
  evalString,
  evalFile,
  evalStream
 };
exports.SibilantContext = SibilantContext;
mixin(SibilantContext, exports);
context.SibilantContext = SibilantContext;