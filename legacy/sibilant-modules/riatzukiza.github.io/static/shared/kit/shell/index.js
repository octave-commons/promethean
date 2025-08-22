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
var fs = require("fs"),
    sibilant = require("sibilant"),
    readline = require("readline");
sibilant.include(require.resolve("./headers/core.sibilant"));
sibilant.include(require.resolve("./headers/shell.sibilant"));
sibilant.include("./headers/interface.sibilant");
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
var appendLine = R.curry((function(path, d) {
  /* eval.sibilant:11:34 */

  return appendFile(path, (d + "\n"));
}));
var appendFile = R.curry((function(path, d) {
  /* eval.sibilant:11:34 */

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
  /* read-history eval.sibilant:44:0 */

  return console.log("reading history");
});
var identity = ((a) => {
	return a;
});
var pipeStreamToActor = R.curry((function(f, actor) {
  /* eval.sibilant:11:34 */

  return (new Promise(((success, fail) => {
  	var resolve = success,
      reject = fail;
  return fs.createReadStream(historyFilePath).on("data", (function() {
    /* eval.sibilant:51:21 */
  
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
  /* inc/scope.sibilant:12:9 */

  return repl.send("(init-shell)").catch((function(b, others) {
    /* inc/console.sibilant:10:8 */
  
    console.log("failed to meta packages", b, others);
    return b;
  })).then((() => {
  	var reader = repl[Reader.symbol];
  rl.on("line", (function() {
    /* eval.sibilant:69:30 */
  
    return repl.send(arguments[0]);
  }));
  repl.on("result", (function() {
    /* eval.sibilant:72:34 */
  
    return rl.prompt(arguments[0]);
  }));
  console.log("ready for input");
  rl.prompt();
  return repl.on("result", (function(b, others) {
    /* inc/console.sibilant:10:8 */
  
    console.log("result:", b, others);
    return b;
  })).on("error", (function(b, others) {
    /* inc/console.sibilant:10:8 */
  
    console.log("error:", b, others);
    return b;
  })).on("log", (function(b, others) {
    /* inc/console.sibilant:10:8 */
  
    console.log("log:", b, others);
    return b;
  }));
  }));
})(create(repl.REPL)().start(), readline.createInterface({ 
  input:process.stdin,
  output:process.stdout,
  prompt:"#>"
 }));