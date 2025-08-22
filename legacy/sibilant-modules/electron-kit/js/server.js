var R = require("ramda");


(function(a, b, c) {
  /* node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);





;
var R = require("ramda"),
    child_process = require("child_process");
var worker = (function worker$(p, f, done) {
  /* worker node_modules/kit/inc/shell.sibilant:12:0 */

  return Promise.resolve(f()).then(done, done);
});
var thenAlways = (function thenAlways$(p, f) {
  /* then-always node_modules/kit/inc/shell.sibilant:15:0 */

  return p.then(((result) => {
  	
    return f(result);
  
  }), ((err) => {
  	
    return f();
  
  }));
});
var either = (function either$(f, g, v) {
  /* either node_modules/kit/inc/shell.sibilant:20:0 */

  return (function() {
    if (v) {
      return f(v);
    } else {
      return g(v);
    }
  }).call(this);
});
var handleExec = (function handleExec$(s, f, e, stdout, stderr) {
  /* handle-exec node_modules/kit/inc/shell.sibilant:23:0 */

  
});
var exec = (function exec$(c, args) {
  /* exec node_modules/kit/inc/core/function-expressions.sibilant:23:8 */

  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return child_process.exec(c, args, ((e, stdout, stderr) => {
    	
      (function() {
        if (stderr.length > 0) {
          return console.log("stderr", stderr.toString());
        }
      }).call(this);
      return (function() {
        if (e) {
          return fail(e);
        } else {
          return success(stdout.toString());
        }
      }).call(this);
    
    }));
  
  })));
});
// thenAlways(thenAlways(thenAlways(thenAlways(exec([ "git", "branch", [ compileBranch ].join("") ].join(" ")), ((result) => {
// 	
//   return exec([ "git", "checkout", [ compileBranch ].join("") ].join(" "));
// 
// })), ((result) => {
// 	
//   return exec([ "git", "add", "." ].join(" "));
// 
// })), ((result) => {
// 	
//   return exec([ "git", "commit", "-m", ("compiled " + path) ].join(" "));
// 
// })), ((result) => {
// 	
//   return exec([ "git", "checkout", [ branchName ].join("") ].join(" "));
// 
// }));


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
var { 
  Interface
 } = require("kit-interface");
var _ = R.__;
var spawn = (require("child_process")).spawn,
    readline = require("readline"),
    fs = require("fs");
var electronProcess = spawn("electron", [ require.resolve("../js/electron-init.js") ], { stdio: [ null, null, null, "ipc" ] }),
    rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
}),
    rlReady = false;
electronProcess.on("exit", process.exit);
electronProcess.stdout.pipe(process.stdout);
electronProcess.stderr.pipe(process.stderr);
var net = require("net");
var repl = require("kit-repl/js/repl");
var REPL = repl.REPL;
var Reader = repl.Reader;
var RemoteEvalSocket = Interface.define("RemoteEvalSocket", { 
  init( socket = this.socket,validator = create(Reader)() ){ 
    
      this.socket = socket;this.validator = validator;
      return this;
    
   },
  send( d = this.d,validator = this.validator ){ 
    
      return validator.send(d);
    
   },
  start( validator = this.validator,socket = this.socket ){ 
    
      validator.on("message", ((d) => {
      	
        return socket.write(d);
      
      })).once("error", ((err) => {
      	
        console.log("error on", "message", "of", "validator", "given", "d()");
        return console.log(err);
      
      }));
      return this;
    
   },
  stop( validator = this.validator,socket = this.socket ){ 
    
      console.log("stoping eval socket");
      return validator.removeAllListeners("message");
    
   }
 });
var remoteEvalSocket = create(RemoteEvalSocket);
net.createServer(((socket) => {
	
  var app = remoteEvalSocket(socket).start(),
      send = (function() {
    /* src/server.sibilant:60:12 */
  
    return app.send(arguments[0]);
  }),
      stop = (function() {
    /* src/server.sibilant:61:12 */
  
    return app.stop(arguments[0]);
  }),
      prompt = (() => {
  	
    return rl.prompt();
  
  });
  rl.on("line", send);
  app.validator.on("message", prompt);
  socket.on("error", (function(b, ...others) {
    /* node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("REPL server socket error:", b, ...others);
    return b;
  }));
  socket.once("end", stop);
  socket.once("close", (function(b, ...others) {
    /* node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("server socket closed", b, ...others);
    return b;
  }));
  return socket.once("end", (() => {
  	
    rl.removeListener("line", send);
    return app.validator.removeListener("message", prompt);
  
  }));

})).listen(8120);