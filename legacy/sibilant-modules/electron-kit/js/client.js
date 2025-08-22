

(function(a, b, c) {
  /* node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);





;
var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var fs = require("fs"),
    sibilant = require("sibilant"),
    readline = require("readline");
var repl = require("kit-repl/js/repl");
var REPL = repl.REPL;
var { 
  Interface
 } = require("kit-interface");
var Path = require("path");
mixin({ 
  R:require("ramda"),
  sibilant,
  process,
  module,
  exports,
  require( path ){ 
    
      console.log("requiring", path);
      return require((function() {
        if (path[0] === ".") {
          console.log("local file", path);
          return Path.join("./sib", path);
        } else {
          console.log("node_module file");
          return path;
        }
      }).call(this));
    
   },
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 }, global);
var appendLine = R.curry(((path, d) => {
	
  return appendFile(path, (d + "\n"));

}));
var appendFile = R.curry(((path, d) => {
	
  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return fs.appendFile(path, d, ((e) => {
    	
      return (function() {
        if (e) {
          return fail(e);
        } else {
          return success();
        }
      }).call(this);
    
    }));
  
  })));

}));
var historyFilePath = "./history.sibilant";
var identity = ((a) => {
	
  return a;

});
var StringReader = Interface.define("StringReader", { 
  init( stream = this.stream,actor = create(Actor)() ){ 
    
      this.stream = stream;this.actor = actor;
      return this;
    
   },
  get string(  ){ 
    
      return this.exaust();
    
   },
  each( f = this.f,stream = this.stream,actor = this.actor ){ 
    
      return (new Promise(((success, fail) => {
      	
        var resolve = success,
            reject = fail;
        return stream.on("data", (function() {
          /* src/client.sibilant:54:23 */
        
          return actor.send((function() {
            /* src/macros/pipe.sibilant:66:9 */
          
            f(arguments[0]);
            return arguments[0];
          })((arguments[0] + "")));
        })).on("end", success);
      
      })));
    
   },
  map( f = this.f,stream = this.stream,actor = this.actor ){ 
    
      return stream.on("data", (function() {
        /* src/client.sibilant:58:22 */
      
        return actor.send(f((arguments[0] + "")));
      }));
    
   },
  exaust( stream = this.stream ){ 
    
      var d = "";
      return (new Promise(((success, fail) => {
      	
        var resolve = success,
            reject = fail;
        return this.each(((chunk) => {
        	
          return d += chunk;
        
        }));
      
      })));
    
   }
 });
var { 
  Evaluator
 } = require("./evaluator");
var net = require("net");
var socket = net.connect(8120);
var app = create(REPL)().start();
var aprint = (function aprint$(...argsa) {
  /* aprint src/client.sibilant:72:0 */

  return ((...argsb) => {
  	
    return alert(...argsa, ...argsb);
  
  });
});
var evalString = (function evalString$(sibilantString = this.sibilantString, name = this.name) {
  /* eval-string node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  console.log("compiling sibilant", sibilantString);
  var js = sibilant(sibilantString).js;
  console.log("evaluating js", js);
  ++(evalIndex);
  return vm.runInThisContext(js, (name + ":" + evalIndex));
});
socket.on("data", (function() {
  /* src/client.sibilant:87:18 */

  return app.send((arguments[0] + ""));
}));
socket.on("end", (function(b, ...others) {
  /* node_modules/kit/inc/console.sibilant:10:8 */

  console.log("client socket ended", b, ...others);
  return b;
}));
socket.on("close", (function(b, ...others) {
  /* node_modules/kit/inc/console.sibilant:10:8 */

  console.log("client socket  closed", b, ...others);
  return b;
}));
socket.on("error", (function(b, ...others) {
  /* node_modules/kit/inc/console.sibilant:10:8 */

  console.log("REPL client socket error", b, ...others);
  return b;
}));
(function() {
  /* src/macros/pipe.sibilant:66:9 */

  arguments[0][repl.Compiler.symbol].on("message", R.pipe(appendLine("./history.js"), (function() {
    /* src/client.sibilant:98:33 */
  
    return arguments[0].catch((function(b, ...others) {
      /* node_modules/kit/inc/console.sibilant:10:8 */
    
      console.log("failed to append history", b, ...others);
      return b;
    }));
  })));
  return arguments[0];
})((function() {
  /* src/macros/pipe.sibilant:66:9 */

  arguments[0][repl.Reader.symbol].on("message", R.pipe(appendLine(historyFilePath), (function() {
    /* src/client.sibilant:95:33 */
  
    return arguments[0].catch((function(b, ...others) {
      /* node_modules/kit/inc/console.sibilant:10:8 */
    
      console.log("failed to append history", b, ...others);
      return b;
    }));
  })));
  return arguments[0];
})(app)).on("result", (function(b, ...others) {
  /* node_modules/kit/inc/console.sibilant:10:8 */

  console.log("result:", b, ...others);
  return b;
})).on("error", ((e) => {
	
  console.log("client error", e);
  throw e

})).on("log", (function(b, ...others) {
  /* node_modules/kit/inc/console.sibilant:10:8 */

  console.log("log:", b, ...others);
  return b;
}));