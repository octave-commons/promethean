
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
    define(name = this.name,
           _obj = this._obj,
           _types = this._types,
           _symbols = this._symbols,
           _shares = (_obj.borrows || _obj.shares || []),
           _ext = (_obj.extend || {}),
           _build = _obj.build) {

        return (function() {
            if (name in _symbols) {
                return mixin(_obj, _types[_symbols[name]]);
            } else {
                return this.create(name, _obj);
            }
        }).call(this);

    },
    create(name = this.name,
           _obj = this._obj,
           _types = this._types,
           _symbols = this._symbols,
           _shares = (_obj.borrows || _obj.shares || []),
           _ext = (_obj.extend || {}),
           _build = _obj.build,
           _symbol = Symbol(name)) {

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
exports.Interface = Interface;
var Tree = Interface.define("Tree", {
    init() {


        return this;

    },
    value: null,
    parent: null,
    branch__QUERY(value = this.value) {

        return null === value;

    },
    leaf__QUERY(value = this.value) {

        return !(null === value);

    },
    descend(seq = this.seq, f = this.f, tree = this) {

        return (function() {
            if (0 === seq.length) {
                return tree;
            } else {
                return f(tree, seq);
            }
        }).call(this);

    },
    delete(seq = this.seq) {

    },
    find(seq = this.seq, tree = this) {

        return (function() {
            if (0 === seq.length) {
                return tree;
            } else {
                return tree._find(seq);
            }
        }).call(this);

    },
    has(seq = this.seq, tree = this) {

        return (function() {
            if (tree.find(seq)) {
                return true;
            } else {
                return false;
            }
        }).call(this);

    },
    insert(seq = this.seq, tree = this) {

        return (function() {
            if (0 === seq.length) {
                return tree;
            } else {
                return (function(node) {
                    /* node_modules/kit/inc/macros.sibilant:162:9 */

                    return node.insert(seq.slice(1));
                })(tree._insert(seq));
            }
        }).call(this);

    },
    set(seq = this.seq, value = this.value, tree = this) {

        return tree.insert(seq).value = value;

    },
    each(f = this.f, condition = this.leaf__QUERY, _children = this._children) {

        return _children.each(((node, k) => {

            return (function() {
                if (condition(node)) {
                    return f(node, k);
                } else {
                    return node.each(f, condition);
                }
            }).call(this);

        }));

    }
});
exports.Tree = Tree;
var TreeMap = Interface.define("TreeMap", {
    init(value = this.value, parent = this.parent, _children = (new Map())) {

        this.value = value;
        this.parent = parent;
        this._children = _children;
        return this;

    },
    extend: Tree,
    add(key = this.key, tree = this, _children = tree._children) {

        var node = (_children.get(key) || create(tree)(undefined, tree));
        node.key = key;
        return node;

    },
    delete(seq = this.seq, tree = this) {

        var node = tree.find(seq),
            rkeys = seq.reverse();
        return rkeys.each(((k) => {

            node.parent._children.delete(k);
            return node = node.parent;

        }));

    },
    _find(seq = this.seq,
          tree = this,
          _children = tree._children,
          node = _children.get(seq[0])) {

        return (function() {
            if (node) {
                return node.find(seq.slice(1));
            } else {
                return false;
            }
        }).call(this);

    },
    _insert(seq = this.seq,
            _children = this._children,
            tree = this,
            node = tree.add(seq[0])) {

        _children.set(seq[0], node);
        return node;

    }
});
exports.TreeMap = TreeMap;
