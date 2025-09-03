// SPDX-License-Identifier: GPL-3.0-only
(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);


;

;
var Descriptions = {};
var R = require("ramda");
var fmap = R.curry(((f, a) => {

    return a.map(f);

}));
var is = {
    string(v) {

        return typeof v === "string";

    }
};
is.empty__QUERY = (function is$empty__QUERY$(value) {
    /* is.empty? node_modules/kit/inc/core/fp.sibilant:12:0 */

    return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
    /* athrow node_modules/kit/inc/core/fp.sibilant:14:0 */

    return (() => {

        return (new errType(message));

    });
});
var getValueOf = (function getValueOf$(o) {
    /* get-value-of node_modules/kit/inc/core/fp.sibilant:17:0 */

    return o.getValue();
});
var {
    create,
    extend,
    mixin,
    conditional,
    cond,
    partiallyApplyAfter
} = require("kit/js/util");


(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);


;

;


(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);


;

;
var Descriptions = {};
var R = require("ramda");
var fmap = R.curry(((f, a) => {

    return a.map(f);

}));
var is = {
    string(v) {

        return typeof v === "string";

    }
};
is.empty__QUERY = (function is$empty__QUERY$(value) {
    /* is.empty? node_modules/kit/inc/core/fp.sibilant:12:0 */

    return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
    /* athrow node_modules/kit/inc/core/fp.sibilant:14:0 */

    return (() => {

        return (new errType(message));

    });
});
var getValueOf = (function getValueOf$(o) {
    /* get-value-of node_modules/kit/inc/core/fp.sibilant:17:0 */

    return o.getValue();
});
var {
    create,
    extend,
    mixin,
    conditional,
    cond,
    partiallyApplyAfter
} = require("kit/js/util");
var Interface = {};
mixin({
    _symbols: {},
    _types: {},
    init(name = this.name, _obj = this._obj, _types = {}, _symbols = {}) {

        this.name = name;
        this._obj = _obj;
        this._types = _types;
        this._symbols = _symbols;
        return this;

    },
    define(name = this.name, _obj = this._obj, _types = this._types, _symbols = this._symbols, _shares = (_obj.borrows || _obj.shares || []), _ext = (_obj.extend || {}), _build = _obj.build) {

        return (function() {
            if (name in _symbols) {
                return mixin(_obj, _types[_symbols[name]]);
            } else {
                return this.create(name, _obj);
            }
        }).call(this);

    },
    create(name = this.name, _obj = this._obj, _types = this._types, _symbols = this._symbols, _shares = (_obj.borrows || _obj.shares || []), _ext = (_obj.extend || {}), _build = _obj.build, _symbol = Symbol(name)) {

        return (function(m) {
            /* node_modules/kit/inc/macros.sibilant:162:9 */

            _symbols[name] = _symbol;
            _types[_symbol] = m;
            (function() {
                if (_build) {
                    return m.build();
                }
            }).call(this);
            return m;
        })(extend(_ext, mixin([{
            name,
            symbol: _symbol
        }, ..._shares], _obj)));

    }
}, Interface);
sibilant.include("kit/header");
var logFile = fs.createWriteStream("./log");
var logStreams = (new Set([logFile]));
var stdout = process.stdout;
exports.logStreams = logStreams;
var writeLine = R.curry(((data, socket) => {

    return (new Promise(((success, fail) => {

        var resolve = success,
            reject = fail;
        return socket.write((data.toString() + "\n"), (() => {

            return success(data);

        }));

    })));

}));
var writeJs = R.curry(((js, socket) => {

    return (new Promise(((success, fail) => {

        var resolve = success,
            reject = fail;
        return socket.write(("```js\n" + js + "\n```\n"), (() => {

            return success(js);

        }));

    })));

}));
var {
    __: _
} = R;
var seconds = (function seconds$(n) {
    /* seconds src/util.sibilant:25:0 */

    return (n * 1000);
});
var logReply = ((d) => {

        return console.log(d.toString());

    }),
    logError = ((e) => {

        return console.error(e.message);

    });
var createServer = (function createServer$(_context) {
    /* create-server src/util.sibilant:30:0 */

    return net.createServer(bindSocket(createContext(_context)));
});
var bindSocket = R.curry(((context, socket) => {

    "Binds a socket to a context, causing all data from the socket to be parsed to\n" + "js from sibilant and evaluated in the context given";
    var reader = create(Reader)().start();
    reader.on("expression", bindEval(context, socket));
    socket.on("data", (function() {
        /* src/util.sibilant:42:20 */

        return reader.send(arguments[0]);
    })).on("close", (() => {

        return logStreams.delete(socket);

    }));
    return logStreams.add(socket);

}));
var createContext = (function createContext$(_context) {
    /* create-context src/util.sibilant:46:0 */

    return vm.createContext(mixin([_context, {
        sibilant
    }]));
});
var {
    EventEmitter
} = require("events");
var resolve = (function resolve$(v) {
    /* resolve src/actor.sibilant:3:0 */

    return Promise.resolve(v);
});
var Emitter = Interface.define("Emitter", {
    init() {


        EventEmitter.call(this);
        return this;

    },
    extend: EventEmitter.prototype
});
var Actor = Interface.define("Actor", {
    init(promise = resolve()) {

        this.promise = promise;
        Emitter.init.call(this);
        this.on("error", ((e) => {

            return this.promise = resolve();

        }));
        return this;

    },
    extend: Emitter,
    send(msg) {

        return this.promise = this.promise.then(((nil) => {

            return this.emit("message", msg);

        })).catch(((e) => {

            this.emit("error", e);
            throw e

        }));

    }
});
var scanning__QUERY = (function scanning__QUERY$(parser) {
    /* scanning? src/reader.sibilant:3:0 */

    return !((parser.inQuote || parser.comment));
});
var readers = {
    "\"": (function(c) {
        /* src/reader.sibilant:8:12 */

        this.inQuote = !(this.inQuote);
        return c;
    }),
    ";": (function(c) {
        /* src/reader.sibilant:9:11 */

        this.comment = true;
        return "";
    })
};
readers["("] = (function(char) {
    /* src/reader.sibilant:13:13 */

    return (function() {
        if (scanning__QUERY(this)) {
            ((this.parens) ++);
            return char;
        }
    }).call(this);
});
readers[")"] = (function(char) {
    /* src/reader.sibilant:13:13 */

    return (function() {
        if (scanning__QUERY(this)) {
            ((this.parens) --);
            return char;
        }
    }).call(this);
});
readers["["] = (function(char) {
    /* src/reader.sibilant:13:13 */

    return (function() {
        if (scanning__QUERY(this)) {
            ((this.squareBraces) ++);
            return char;
        }
    }).call(this);
});
readers["]"] = (function(char) {
    /* src/reader.sibilant:13:13 */

    return (function() {
        if (scanning__QUERY(this)) {
            ((this.squareBraces) --);
            return char;
        }
    }).call(this);
});
readers["{"] = (function(char) {
    /* src/reader.sibilant:13:13 */

    return (function() {
        if (scanning__QUERY(this)) {
            ((this.curlyBraces) ++);
            return char;
        }
    }).call(this);
});
readers["}"] = (function(char) {
    /* src/reader.sibilant:13:13 */

    return (function() {
        if (scanning__QUERY(this)) {
            ((this.curlyBraces) --);
            return char;
        }
    }).call(this);
});
var Reader = Interface.define("Reader", {
    init(fragment = [], parens = 0, squareBraces = 0, curlyBraces = 0, inQuote__QUERY = false) {

        this.fragment = fragment;
        this.parens = parens;
        this.squareBraces = squareBraces;
        this.curlyBraces = curlyBraces;
        this.inQuote__QUERY = inQuote__QUERY;
        Actor.init.call(this);
        return this;

    },
    extend: Actor,
    parsers: (new Map()),
    spawn(compiler) {

        return (function() {
            if (this.parsers.has(compiler)) {
                return this.parsers.get(compiler);
            } else {
                return (function(value) {
                    /* node_modules/kit/inc/macros.sibilant:162:9 */

                    this.parsers.set(compiler, value);
                    return value;
                })((function() {
                    /* node_modules/kit/inc/macros.sibilant:13:25 */

                    return create(Parser)().start();
                }).call(this));
            }
        }).call(this);

    },
    start() {

        return this.on("message", ((string) => {

            return this.promise = this.promise.then(((nil) => {

                console.log("message");
                return this.validate(string);

            })).catch(((e) => {

                this.emit("error", e);
                throw e

            }));

        }));

    },
    validate(string = this.string, fragment = this.fragment) {

        var lines = string.split("\n");
        return lines.each(((l) => {

            return this.handleLine(l);

        }));

    },
    handleLine(line = this.line) {

        return this.promise = this.promise.then(((nil) => {

            var looping = true,
                i = 0;
            var chars = line.split("");
            this.comment = false;
            return (function() {
                var while$1 = undefined;
                while ((looping && !(this.comment))) {
                    while$1 = (function() {
                        var char = chars[((i) ++)];
                        (function() {
                            if (readers[char]) {
                                return char = readers[char].call(this, char);
                            }
                        }).call(this);
                        return (function() {
                            if (looping) {
                                this.fragment.push(char);
                                (function() {
                                    if ((!(this.parens) && !(this.curlyBraces) && !(this.squareBraces))) {
                                        var s = this.fragment.join("").trim();
                                        (function() {
                                            if (!(s.length === 0)) {
                                                return this.emit("expression", s);
                                            }
                                        }).call(this);
                                        return this.fragment = [];
                                    }
                                }).call(this);
                                return (function() {
                                    if (i >= chars.length) {
                                        return looping = false;
                                    }
                                }).call(this);
                            }
                        }).call(this);
                    }).call(this);
                };
                return while$1;
            }).call(this);

        })).catch(((e) => {

            this.emit("error", e);
            throw e

        }));

    }
});
var child_process = require("child_process"),
    sibilant = require("sibilant"),
    {
        inspect
    } = require("util");
var Server = Interface.define("Server", {
    init(network = Network.spawn(), reader = Reader.spawn(), compiler = Compiler.spawn(), evaluator = Evaluator.spawn(), printer = Printer.spawn(network)) {

        this.network = network;
        this.reader = reader;
        this.compiler = compiler;
        this.evaluator = evaluator;
        this.printer = printer;
        Actor.init.call(this);
        return this;

    },
    extend: Actor,
    start(network = this.network, evaluator = this.evaluator, reader = this.reader, printer = this.printer) {

        network.on("packet", reader.());
        reader.on("expression", compiler.());
        compiler.on("code", evaluator.());
        return evaluator.on("result", printer.());

    },
    stop() {

    },
    spawn() {

    }
});
exports.Server = Server;
var readline = require("readline"),
    net = require("net");
var Client = Interface.define("Client", {
    init(port = this.port, host = this.host, input = this.input, output = this.output, retryInterval = seconds(5), rl = readline.createInterface({
        input,
        output,
        prompt: "#>"
    })) {

        this.port = port;
        this.host = host;
        this.input = input;
        this.output = output;
        this.retryInterval = retryInterval;
        this.rl = rl;
        return this;

    },
    clients: (new Map()),
    spawn(lit = port, clients = this.clients) {

        return (function() {
            if (this.clients.has(("" + host + ":" + port))) {
                return this.clients.get(("" + host + ":" + port));
            } else {
                return (function(value) {
                    /* node_modules/kit/inc/macros.sibilant:162:9 */

                    this.clients.set(("" + host + ":" + port), value);
                    return value;
                })((function() {
                    /* node_modules/kit/inc/macros.sibilant:13:25 */

                    return create(Client)(port, host, input, output, retryInterval);
                }).call(this));
            }
        }).call(this);

    },
    _reconnect(retryInterval = this.retryInterval) {

        return wait(retryInterval).then((() => {

            return this.connect();

        }));

    },
    write(d) {

        return (new Promise(((success, fail) => {

            var resolve = success,
                reject = fail;
            return this._socket.once("error", fail).write(d, (() => {

                this._socket.removeListener("error", fail);
                return success();

            }));

        })));

    },
    connect(port = this.port, rl = this.rl) {

        return (function() {
            /* macros.sibilant:2:27 */

            rl.on("line", (($fpipe) => {

                return this.write($fpipe);

            }));
            this._socket = net.connect(port).on("data", logReply).on("close", (() => {

                return this._reconnect();

            })).on("error", logError);
            return this;
        }).call(this);

    }
});
exports.Client = Client;
exports.Server = Server;
exports.Client = Client;
exports.logStreams = logStreams;
