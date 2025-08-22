var R = require("ramda");
var fmap = R.curry((f, a) => {

    return a.map(f);

});
var is = {
    string(v) {

        return typeof v === "string";

    }
};
is.empty__QUERY = (function is$empty__QUERY$(value) {
    /* is.empty? ../../node_modules/kit/inc/core/fp.sibilant:12:0 */

    return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
    /* athrow ../../node_modules/kit/inc/core/fp.sibilant:14:0 */

    return () => {

        return (new errType(message));

    };
});
var getValueOf = (function getValueOf$(o) {
    /* get-value-of ../../node_modules/kit/inc/core/fp.sibilant:17:0 */

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
var {
    ProbabilityTree
} = require("./probability-tree");
var {
    FileSystem
} = require("./file-system");
var Path = require("path");
var Storage = Interface.define("Storage", {
    init() {


        return this;

    },
    fs: create(FileSystem)("."),
    save(p = this.p, m = this.m, fs = this.fs) {

        return fs.insert(p).then((nil) =>
                                 {

            return (function(sequences, counts) {/* ../../node_modules/kit/inc/macros.sibilant:162:9 */
                return Promise.all
                ([fs.set(Path.join(p, "counts.json"), JSON.stringify(counts)),
                  fs.set(Path.join(p, "sequences.json"), JSON.stringify(sequences))]);})

            (m._nodes.map(($fpipe) => $fpipe.seq),
             m._nodes.map(($fpipe) => $fpipe.count));});},

    load(p = this.p, fs = this.fs)
    {var m = create(Model)();
     return Promise.all
     ([fs
       .find(Path.join(p, "counts.json"))
       .then(($fpipe) => $fpipe.string)
       .then(JSON.parse),

       fs.find(Path.join(p, "sequences.json"))
       .then(($fpipe) => $fpipe.string)
       .then(JSON.parse)]) .then

     (([counts, sequences]) =>
      sequences
      .reduce
      ((m, s, i) =>
       (m.add(s, counts[i]),m) , m));}});

exports.Storage = Storage;
var summate = (function summate$(arr, f) {
    /* summate src/model.sibilant:44:0 */

    return arr.reduce((a, b, i) => {

        return (a + f(b, i));

    }, 0);
});
var Model = Interface.define("Model", {
    init(_root = create(ProbabilityTree)(), _nodes = []) {

        this._root = _root;
        this._nodes = _nodes;
        _root._model = this;
        return this;

    },
    get total() {

        return summate(this._nodes, ($fpipe) => {

            return $fpipe.count;

        });

    },
    each(f) {

        this._root.each(f);
        return this;

    },
    models: (new Map()),
    save(path = this.path, m = this) {

        return ModelStorage.save(path, m);

    },
    load(path = this.path) {

        return ModelStorage.load(path);

    },
    randomWalk(n = this.n, f = this.f, m = this) {

        var t = m.random();
        var gram = t.seq.slice(1);
        var out = [];
        (function() {
            /* ../../node_modules/kit/inc/macros.sibilant:73:8 */

            var $for = null;
            for (var i = 0; i < n; ++(i)) {
                $for = (function() {
                    /* ../../node_modules/kit/inc/macros.sibilant:75:35 */

                    t = m.given(f(gram)).random();
                    gram = t.seq.slice(1);
                    return out.push(t.seq.slice(-1)[0]);
                }).call(this);
            };
            return $for;
        }).call(this);
        return out;

    },
    randomSequence(n = this.n, m = this) {

        var t = m.random();
        var gram = t.seq.slice(1);
        var out = [];
        (function() {
            /* ../../node_modules/kit/inc/macros.sibilant:73:8 */

            var $for = null;
            for (var i = 0; i < n; ++(i)) {
                $for = (function() {
                    /* ../../node_modules/kit/inc/macros.sibilant:75:35 */

                    t = m.given(gram).random();
                    gram = t.seq.slice(1);
                    return out.push(t.seq.slice(-1)[0]);
                }).call(this);
            };
            return $for;
        }).call(this);
        return out;

    },
    generateRandomPhrase(n = this.n, m = this) {

        return m.randomSequence(n).join(" ");

    },
    _nextGram(m) {

        return (gram, t) => {

            m.add(gram);
            return [...gram.slice(1), t];

        };

    },
    train(n = this.n, tokens = this.tokens, m = this, _nextGram = this._nextGram) {

        var gram = (function() {
            /* src/model.sibilant:5:8 */

            var r = [];
            (function() {
                /* ../../node_modules/kit/inc/macros.sibilant:73:8 */

                var $for = null;
                for (var i = 0; i < n; ++(i)) {
                    $for = (function() {
                        /* ../../node_modules/kit/inc/macros.sibilant:75:35 */

                        return r.push((function() {
                            /* src/model.sibilant:7:31 */

                            return null;
                        }).call(this));
                    }).call(this);
                };
                return $for;
            }).call(this);
            return r;
        }).call(this);
        tokens.push(...gram);
        return tokens.reduce(_nextGram(m), gram);

    },
    given(seq = this.seq, models = this.models) {

        return (function() {
            if (seq.length > 0) {
                return (function(_root, _nodes) {
                    /* ../../node_modules/kit/inc/macros.sibilant:162:9 */

                    return (function() {
                        if (_root) {
                            _root.each((node) => {

                                return (function() {
                                    if (!(node.value === null)) {
                                        return _nodes.push(node);
                                    }
                                }).call(this);

                            });
                            return (function() {
                                if (models.has(_root)) {
                                    return models.get(_root);
                                } else {
                                    return (function(value) {
                                        /* ../../node_modules/kit/inc/macros.sibilant:162:9 */

                                        models.set(_root, value);
                                        return value;
                                    })((function() {
                                        /* ../../node_modules/kit/inc/macros.sibilant:13:25 */

                                        _nodes.sort((a, b) => {

                                            return (a.count - b.count);

                                        });
                                        return create(Model)(create(_root)(null, null, _root.children), _nodes);
                                    }).call(this));
                                }
                            }).call(this);
                        } else {
                            throw (new Error("mis counting has occured"))
                        }
                    }).call(this);
                })(this._root.find(seq), []);
            } else {
                return this;
            }
        }).call(this);

    },
    random() {

        this.sort();
        var t = this.total;
        var r = Math.floor((Math.random() * t)),
            c = 0,
            i = 0;
        var node = this._nodes[i];
        c += node.count;
        (function() {
            var while$1 = undefined;
            while (!(c > r)) {
                while$1 = (function() {
                    ++(i);
                    node = this._nodes[i];
                    return c += node.count;
                }).call(this);
            };
            return while$1;
        }).call(this);
        return node;

    },
    likelyhood(seq) {

        var node = this._root.find(seq);
        return (node.count / this.total);

    },
    save(fs, path) {

    },
    sort() {

        return this._nodes.sort((a, b) => {

            return (a.count - b.count);

        });

    },
    addCount(seq = this.seq, n = this.n) {

        return this._root.traceFrom(seq, (function() {
            /* src/model.sibilant:153:32 */

            return arguments[0].count += n;
        }));

    },
    subCount(seq = this.seq, n = this.n) {

        return this._root.traceFrom(seq, (function() {
            /* src/model.sibilant:156:32 */

            return decrBy(arguments[0].count, n);
        }));

    },
    degrade(seq) {

        var node = this._root.find(seq);
        return (function() {
            if ((!(null === node) && typeof node !== "undefined" && node.count > 1)) {
                return (function() {
                    var while$2 = undefined;
                    while (!(node === null)) {
                        while$2 = (function() {
                            --(node.count);
                            return node = node.parent;
                        }).call(this);
                    };
                    return while$2;
                }).call(this);
            }
        }).call(this);

    },
    add(seq = this.seq, t = 1) {

        var node = this._root.insert(seq);
        (function() {
            if (node.value) {
                return node.value.count = (node.value.count + t);
            } else {
                node.value = {
                    seq,
                    count: t
                };
                return this._nodes.push(node);
            }
        }).call(this);
        return node;

    }
});
exports.Model = Model;
