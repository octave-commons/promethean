

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
sibilant.include("kit/header");
sibilant.include(require.resolve("./meta"));
sibilant.include("kit-interface/header");
module.filename = process.cwd();
(function() {
  if (fs.existsSync("./.sibilant/meta.sibilant")) {
    return sibilant.include("./.sibilant/meta");
  }
}).call(this);
var Path = require("path");
mixin({ 
  sibilant:require("sibilant"),
  R:require("ramda"),
  process,
  module,
  exports,
  require( modulePath ){ 
    
      return require((function() {
        if (modulePath[0] === ".") {
          return Path.join(process.cwd(), modulePath);
        } else {
          return modulePath;
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
var readHistory = (function readHistory$(actor) {
  /* read-history src/index.sibilant:45:0 */

  return console.log("reading history");
});
var identity = ((a) => {
	
  return a;

});
var pipeStreamToActor = R.curry(((f, actor) => {
	
  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return fs.createReadStream(historyFilePath).on("data", (function() {
      /* src/index.sibilant:52:21 */
    
      return actor.send((function() {
        /* src/macros/pipe.sibilant:66:9 */
      
        f(arguments[0]);
        return arguments[0];
      })((arguments[0] + "")));
    })).on("end", success).on("error", fail);
  
  })));

}));
var Reader = repl.Reader;
(function(repl, rl) {
  /* node_modules/kit/inc/scope.sibilant:12:9 */

  return repl.send("(init-shell)").catch((function(b, ...others) {
    /* node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("failed to meta packages", b, ...others);
    return b;
  })).then((() => {
  	
    var reader = repl[Reader.symbol];
    rl.on("line", (function() {
      /* src/index.sibilant:70:30 */
    
      return repl.send(arguments[0]);
    }));
    repl.on("result", (function() {
      /* src/index.sibilant:73:34 */
    
      return rl.prompt(arguments[0]);
    }));
    console.log("ready for input");
    rl.prompt();
    return repl.on("result", (function(b, ...others) {
      /* node_modules/kit/inc/console.sibilant:10:8 */
    
      console.log("result:", b, ...others);
      return b;
    })).on("error", (function(b, ...others) {
      /* node_modules/kit/inc/console.sibilant:10:8 */
    
      console.log("error:", b, ...others);
      return b;
    })).on("log", (function(b, ...others) {
      /* node_modules/kit/inc/console.sibilant:10:8 */
    
      console.log("log:", b, ...others);
      return b;
    }));
  
  }));
})(create(repl.REPL)().start(), readline.createInterface({ 
  input:process.stdin,
  output:process.stdout,
  prompt:"#>"
 }));