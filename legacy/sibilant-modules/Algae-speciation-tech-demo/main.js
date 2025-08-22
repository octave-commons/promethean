var R = require("ramda");


(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);


;


(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);


;
var R = require("ramda"),
    child_process = require("child_process");
var worker = (function worker$(p, f, done) {
    /* worker node_modules/kit/inc/shell.sibilant:10:0 */

    return Promise.resolve(f()).then(done, done);
});
var thenAlways = (function thenAlways$(p, f) {
    /* then-always node_modules/kit/inc/shell.sibilant:13:0 */

    return p.then((result) => {

        return f(result);

    }, (err) => {

        return f();

    });
});
var either = (function either$(f, g, v) {
    /* either node_modules/kit/inc/shell.sibilant:18:0 */

    return (function() {
        if (v) {
            return f(v);
        } else {
            return g(v);
        }
    }).call(this);
});
var handleExec = (function handleExec$(s, f, e, stdout, stderr) {
    /* handle-exec node_modules/kit/inc/shell.sibilant:21:0 */


});
var exec = (function exec$(c, args) {
    /* exec node_modules/kit/inc/core/function-expressions.sibilant:25:8 */

    return (new Promise((success, fail) => {

        var resolve = success,
            reject = fail;
        return child_process.exec(c, args, (e, stdout, stderr) => {

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

        });

    }));
});
// thenAlways(thenAlways(thenAlways(thenAlways(exec([ "git", "branch", [ compileBranch ].join("") ].join(" ")), (result) => {
// 	
//   return exec([ "git", "checkout", [ compileBranch ].join("") ].join(" "));
// 
// }), (result) => {
// 	
//   return exec([ "git", "add", "." ].join(" "));
// 
// }), (result) => {
// 	
//   return exec([ "git", "commit", "-m", ("compiled " + path) ].join(" "));
// 
// }), (result) => {
// 	
//   return exec([ "git", "checkout", [ branchName ].join("") ].join(" "));
// 
// });
thenAlways(exec(["ls", "."].join(" ")), (result) => {

    return exec(["ls", "-gl"].join(" "));

}).then((function(b, ...others) {
    /* node_modules/kit/inc/console.sibilant:10:8 */

    console.log("ls", b, ...others);
    return b;
}));
var either = (function either$(left, right, value) {
    /* either fp.sibilant:2:0 */

    return (function() {
        if (value) {
            return left(value);
        } else {
            return right(value);
        }
    }).call(this);
});
var conditional = (function conditional$(value, pred, action, ...rest) {
    /* conditional fp.sibilant:5:0 */

    "A functional conditional operator. Immediately evaluates its arguements.";
    return (function() {
        if (action) {
            return (function() {
                if (pred(value)) {
                    return action(value);
                } else {
                    return conditional(value, ...rest);
                }
            }).call(this);
        } else if (pred) {
            return pred(value);
        } else {
            return value;
        }
    }).call(this);
});
var cond = (function cond$(pred, action, ...rest) {
    /* cond fp.sibilant:16:0 */

    "A lazy application of a functional conditional operator.\n" +
    "Waits for a value to be given to it before applying its functional arguements";
    return (value) => {

        return conditional(value, pred, action, ...rest);

    };
});
var partiallyApplyAfter = (function partiallyApplyAfter$(f, ...args) {
    /* partially-apply-after fp.sibilant:21:0 */

    return (function(...restArgs) {
        /* fp.sibilant:22:2 */

        return f(...restArgs, ...args);
    });
});
var toString = R.invoker(0, "toString");
var spawn = (require("child_process")).spawn,
    readline = require("readline"),
    fs = require("fs");
var electronProcess = spawn("npm", ["start"], {
        stdio: [null, null, null, "ipc"]
    }),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    rlReady = false;
electronProcess.stdout.pipe(process.stdout);
electronProcess.stderr.pipe(process.stderr);
var net = require("net");
var startReadline = (function startReadline$(socket) {
    /* start-readline main.sibilant:44:0 */

    console.log("client connected to repl");
    rl.resume();
    socket.pipe(process.stdout);
    socket.on("close", () => {

        console.log("readline closed");
        rl.removeAllListeners("line");
        return rl.pause();

    }).once("error", (err) => {

        console.log("error on", "close", "of", "socket", "given", "null");
        return console.log(err);

    });
    var handleLine = (function handleLine$(msg) {
        /* handle-line main.sibilant:57:2 */

        return socket.write((msg + "\n"));
    });
    return rl.on("line", handleLine);
});
var readlineServer = net.createServer(startReadline).listen(8120);
(function() {
    if (!(rlReady)) {
        rlReady = true;
        return console.log("readline done loading");
    }
}).call(this);
