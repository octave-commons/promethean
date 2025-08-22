(function(a, b, c) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/defs.sibilant:53:9 */

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
var R = require("ramda");
var exports = {};
var {
    create,
    extend,
    mixin,
    cond,
    partiallyApplyAfter
} = require("kit/js/util"), {
    EventEmitter
} = require("events");
window.size = (function window$size$() {
    /* window.size eval.sibilant:24:0 */

    return [window.innerWidth, window.innerHeight];
});
window.global = window;
var curry = R.curry;
var fmap = R.curry(((f, a) => {

    return a.map(f);

}));
var fset = R.curry(((o, k, v) => {

    return o[k] = v;

}));
var Andy = require("webgl");
var Gl = Andy.gl,
    Color = Andy.Color;
Color.RGBA = Gl.Type.RGBA;
var ubyte = Gl.Type.ubyte,
    Type = Gl.Type;
Andy.ubyte = ubyte;
Andy.Type = Type;
Andy.Gl = Andy.gl;
Andy.Color.RGBA = Type.RGBA;
mixin([Andy.Gl, Andy.Color], Andy);
var {
    Buffer,
    Program,
    Shader,
    Attribute,
    Type,
    Context,
    Uniform
} = Gl, {
    BlendMode
} = Color;
Array.transform = (function Array$transform$(f, a, r = a) {
    /* Array.transform src/client/sidescroller/lib/natives/array.sibilant:1:0 */

    return (function(r) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        a.each(((e, i) => {

            return r[i] = f(e, i);

        }));
        return r;
    })(r);
});
Array.prototype.bind = Array.bind = (function Array$bind$(a, f) {
    /* Array.bind src/client/sidescroller/lib/natives/array.sibilant:5:8 */

    return a.reduce(((r, e, i) => {

        f(e, i).each(((x) => {

            return r.push(x);

        }));
        return r;

    }), []);
});
Array.prototype.each = (function Array$prototype$each$(f) {
    /* Array.prototype.each src/client/sidescroller/lib/natives/array.sibilant:19:0 */

    this.forEach(f);
    return this;
});
Array.prototype.bind = (function Array$prototype$bind$(f) {
    /* Array.prototype.bind src/client/sidescroller/lib/natives/array.sibilant:22:0 */

    return (function(r) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        this.each(((a) => {

            return r.push(f(a));

        }));
        return r;
    })([]);
});
Map.prototype.each = (function Map$prototype$each$(f) {
    /* Map.prototype.each src/client/sidescroller/lib/natives/map.sibilant:1:0 */

    this.forEach(f);
    return this;
});
var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
    /* euclidian-distance src/client/sidescroller/lib/math/geometry.sibilant:1:0 */

    return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var square = (function square$(dim, f) {
    /* square src/client/sidescroller/lib/math/geometry.sibilant:6:0 */

    var lim = Math.round((dim / 2));
    (function() {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

        var $for = null;
        for (var i = (0 - lim); i <= lim; ++(i)) {
            $for = (function() {
                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                return (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

                    var $for = null;
                    for (var j = (0 - lim); j <= lim; ++(j)) {
                        $for = (function() {
                            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                            return f(i, j);
                        }).call(this);
                    };
                    return $for;
                }).call(this);
            }).call(this);
        };
        return $for;
    }).call(this);
    return null;
});
var inverseSquare = (function inverseSquare$(rate, c, pos, {
    x,
    y
}) {
    /* inverse-square src/client/sidescroller/lib/math/geometry.sibilant:21:0 */

    return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});;
var add = (function add$(a, b) {
    /* add src/client/sidescroller/lib/math.sibilant:7:0 */

    return (a + b);
});
var summate = (function summate$(a) {
    /* summate src/client/sidescroller/lib/math.sibilant:8:0 */

    return a.reduce(add, 0);
});
var renderChildren = R.curry(((_parent, c, i, a) => {

    return (function() {
        if (typeof c === "undefined") {
            return null;
        } else if (c.render) {
            return c.render(_parent);
        } else if ((c && "object" === typeof c && "Array" === c.constructor.name)) {
            return c.each(renderChildren(_parent));
        } else if (typeof c === "string") {
            return _parent._node.appendChild(document.createTextNode(c));
        } else if (typeof c === "number") {
            return _parent._node.appendChild(document.createTextNode(("" + c)));
        } else if (typeof c === "function") {
            return renderChildren(_parent, c(_parent));
        } else if ((c instanceof Element)) {
            return (function(node) {
                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                a[i] = node;
                return renderChildren(_parent, node, i, a);
            })(DocumentNode.wrap(c, _parent._node));
        } else {
            return _parent._node.appendChild(c);
        }
    }).call(this);

}));
var DocumentNode = Interface.define("DocumentNode", {
    init(tagName = this.tagName, attributes = this.attributes, _children = [], _parent = this._parent, _node = document.createElement(tagName)) {

        this.tagName = tagName;
        this.attributes = attributes;
        this._children = _children;
        this._parent = _parent;
        this._node = _node;
        EventEmitter.call(this);
        return this;

    },
    extend: EventEmitter.prototype,
    get children() {

        return this._children;

    },
    render(_parent = this._parent, attributes = this.attributes, tagName = this.tagName, _node = this._node, children = this.children) {

        _node.innerHTML = "";
        this._parent = _parent;
        _parent._node.appendChild(_node);
        attributes.each(((a, k) => {

            return _node[k] = a;

        }));
        children.each(renderChildren(this));
        this.emit("render");
        return this;

    },
    wrap(_node, _parent) {

        return create(DocumentNode)(_node.tagName, {}, [], _parent, _node);

    },
    append(node = this.node, children = this.children) {

        children.push(node);
        return this;

    },
    prepend(node = this.node, children = this.children) {

        return this.children = [node, children];

    },
    remove(_node = this._node, _parent = this._parent) {

        _node.remove();
        _parent.children.filter(((c) => {

            return !(_node === c);

        }));
        _parent.emit("remove", _node);
        return this;

    }
});
exports.DocumentNode = DocumentNode;
var DocumentRoot = DocumentNode.define("DocumentRoot", {
    get _parent() {

        return this;

    },
    tagName: "body",
    _node: document.body,
    _children: []
});
exports.DocumentRoot = DocumentRoot;
var createDocumentNode = create(DocumentNode);
console.log(document.appendChild);
var createDocumentNode = create(DocumentNode);
const Tree = {
    symbol: Symbol("Tree")
};
mixin({
    value: null,
    parent: null,
    depth: 0,
    traverseBranches__QUERY: true,
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
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    node.depth = (1 + tree.depth);
                    return node.insert(seq.slice(1));
                })(tree._insert(seq));
            }
        }).call(this);

    },
    set(seq = this.seq, value = this.value, tree = this) {

        return tree.insert(seq).value = value;

    },
    add(key = this.key, tree = this, _children = tree._children) {

        return (_children.get(key) || create(tree)(undefined, tree));

    },
    each(f = this.f, traverseBranches__QUERY = this.traverseBranches__QUERY, leaf__QUERY = this.leaf__QUERY, _children = this._children) {

        var preorderTraverse = (function preorderTraverse$(node, k) {
            /* preorder-traverse ../../kit-lang/shell-utils/shell/node_modules/kit/sib/data-structures/templates/tree.sibilant:47:12 */

            f(node, k);
            return node.each(f);
        });
        return (function() {
            if (traverseBranches__QUERY) {
                return _children.each(preorderTraverse, true, leaf__QUERY, _children);
            } else {
                return _children.each(((node, k) => {

                    return (function() {
                        if (leaf__QUERY(node)) {
                            return f(node, k);
                        } else {
                            return node.each(f, false, leaf, _children);
                        }
                    }).call(this);

                }));
            }
        }).call(this);

    }
}, Tree);
var TreeMap = extend(Tree, {
    symbol: Symbol("TreeMap")
});
mixin({
    init(value = this.value, parent = this.parent, _children = (new Map())) {

        this.value = value;
        this.parent = parent;
        this._children = _children;
        return this;

    },
    _find(seq = this.seq, tree = this, _children = tree._children, node = _children.get(seq[0])) {

        return (function() {
            if (node) {
                return node.find(seq.slice(1));
            } else {
                return false;
            }
        }).call(this);

    },
    _insert(seq = this.seq, _children = this._children, tree = this, node = tree.add(seq[0])) {

        _children.set(seq[0], node);
        return node;

    }
}, TreeMap);
exports.TreeMap = TreeMap;
var {
    Matrix,
    MatrixView,
    Kernel
} = require("kit/js/matrix");
var matrix = create(Matrix);
var kernel = create(Kernel);
var matrixView = create(MatrixView);
var treeMap = create(TreeMap);
var setValue = R.curry(((value, entity) => {

    return entity.value = value;

}));
var curry = R.curry;
var {
    not: fnot,
    pipe: fpipe,
    equals
} = R;
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each src/client/sidescroller/lib/lib.sibilant:50:0 */

    return Object.keys(this).each(((k) => {

        return f(this[k], k);

    }));
});
global.create = create;
global.extend = extend;
global.mixin = mixin;
var green = {
        red: 0,
        green: 255,
        blue: 0
    },
    yellow = {
        red: 255,
        green: 255,
        blue: 0
    };
var memoize = (function memoize$(f) {
    /* memoize src/client/sidescroller/lib/lib.sibilant:61:0 */

    "create a memoized version of any function. A memoized function will return\n" + "previously calculated results from a cache if the arguments given to it are the same";
    var m = {};
    return cond(R.has, R.prop, ((...args) => {

        return f.apply(this, args);

    }));
});
var Ticker = Interface.define("Ticker", {
    state: false,
    ticks: 0,
    get rate() {

        return (1000 / this.fps);

    },
    init(fps = this.fps, events = (new EventEmitter())) {

        this.fps = fps;
        this.events = events;
        return this;

    },
    update(previous = this.previous, rate = this.rate) {

        (function() {
            if (this.state) {
                var now = Date.now();
                this.elapsed = (now - previous);
                window.requestAnimationFrame((() => {

                    return this.update();

                }));
                return (function() {
                    if (this.elapsed > rate) {
                        ++(this.ticks);
                        this.previous = now;
                        return this.events.emit("tick", now, this);
                    }
                }).call(this);
            }
        }).call(this);
        return this;

    },
    start() {

        this.state = true;
        this.previous = Date.now();
        return this.update();

    },
    stop() {

        this.state = false;
        return this;

    }
});
var List = require("../js/list.js"),
    assert = require("assert");
var OrderedMap = Interface.define("OrderedMap", {
    init(_members = (new Map()), _keyPointers = (new Map()), _keys = [], _values = []) {

        this._members = _members;
        this._keyPointers = _keyPointers;
        this._keys = _keys;
        this._values = _values;
        return this;

    },
    has(key = this.key, [_members] = [this._members]) {

        return _members.has(key);

    },
    get(key = this.key, [_members, _, _keys] = [this._members, this._, this._keys]) {

        return _members.get(key);

    },
    each(callback = this.callback, _values = this._values) {

        _values.each(callback);
        return this;

    },
    map(callback = this.callback, [_members, _, _keys, _values] = [this._members, this._, this._keys, this._values]) {

        return (function(r) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            _keys.each(((k) => {

                return r.set(k, f(_members[k], k, r));

            }));
            return r;
        })(create(OrderedMap)());

    },
    delete(key = this.key, [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        var i = _keyPointers[key];
        _members.delete(key);
        _keyPointers.delete(key);
        delete _keys;
        delete i;
        delete _values;
        return delete i;

    },
    push([key, value] = [this.key, this.value], [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        return (function() {
            if (_members.has(key)) {
                return _members.get(key);
            } else {
                return (function(value) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _members.set(key, value);
                    return value;
                })((function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/macros.sibilant:30:25 */

                    _keys.push(key);
                    _keyPointers.set(_values.push(value));
                    return value;
                }).call(this));
            }
        }).call(this);

    },
    pop([_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        var key = _keys.pop(),
            value = _values.pop();
        _keyPointers.pop();
        members.delete(key);
        return value;

    },
    shift([_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        var key = _keys.shift(),
            value = _values.shift();
        _keyPointers.shift();
        _members.delete(key);
        return value;

    },
    unshift([key, value] = [this.key, this.value], [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        return (function() {
            if (_members.has(key)) {
                return _members.get(key);
            } else {
                return (function(value) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _members.set(key, value);
                    return value;
                })((function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/macros.sibilant:30:25 */

                    _keys.unshift(key);
                    _keyPointers.set(_values.unshift(value));
                    return value;
                }).call(this));
            }
        }).call(this);

    },
    set(key = this.key, value = this.value, [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        return (function() {
            if (_members.has(key)) {
                return (function(i) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _values[i] = value;
                    return _members.set(key, value);
                })(_keyPointers[key]);
            } else {
                _keys.push(key);
                _keyPointers.set(_values.push(value));
                _members.set(key, value);
                return value;
            }
        }).call(this);

    }
});
exports.OrderedMap = OrderedMap;
var search = R.curry(((value, array) => {

    return array.find(((v) => {

        return v === value;

    }));

}));
var identity = (function identity$(a) {
    /* identity src/client/sidescroller/lib/collection/ordered-bucket-map.sibilant:3:0 */

    return a;
});
var searchIfGiven = (function searchIfGiven$(array, value) {
    /* search-if-given src/client/sidescroller/lib/collection/ordered-bucket-map.sibilant:5:0 */

    return conditional(array, (() => {

        return typeof value !== "undefined";

    }), search(value), identity);
});
var fprint = (function fprint$($value, ...args) {
    /* fprint src/client/sidescroller/lib/collection/ordered-bucket-map.sibilant:12:0 */

    console.log($value, ...args);
    return $value;
});
var OrderedBucketMap = Interface.define("OrderedBucketMap", {
    init(_buckets = create(OrderedMap)()) {

        this._buckets = _buckets;
        return this;

    },
    set(k = this.k, v = this.v, _buckets = this._buckets) {

        console.log("setting", k, v);
        return (function() {
            if (_buckets.has(k)) {
                return fprint(_buckets.get(k), "bucket at", k).push(v);
            } else {
                return _buckets.push([k, [v]]);
            }
        }).call(this);

    },
    get(k = this.k, value = this.value, _buckets = this._buckets) {

        return _buckets.get(k);

    },
    each(f = this.f, _buckets = this._buckets) {

        return _buckets.each(f);

    },
    map(f = this.f, _buckets = this._buckets) {

        return _buckets.map(f);

    },
    delete([k, value] = [this.k, this.value]) {

    }
});
exports.OrderedBucketMap = OrderedBucketMap;
var BucketedTree = Interface.define("BucketedTree", {
    init(value = [], parent = this.parent, _children = create(OrderedMap)()) {

        this.value = value;
        this.parent = parent;
        this._children = _children;
        return this;

    },
    extend: TreeMap
});
exports.BucketedTree = BucketedTree;
var oldEmit = EventEmitter.prototype.emit;
EventEmitter.prototype.emit = (function EventEmitter$prototype$emit$(event, ...args) {
    /* Event-emitter.prototype.emit src/client/sidescroller/events.sibilant:3:0 */

    oldEmit.call(this, event, ...args);
    return oldEmit.call(this, "*", event, ...args);
});
var e = (new EventEmitter());
var productOf = (function productOf$(a) {
    /* product-of src/client/sidescroller/inc/math.sibilant:1:0 */

    return a.reduce(((value, e) => {

        return (value * e);

    }), 1);
});
var randomUbyte = (function randomUbyte$() {
    /* random-ubyte src/client/sidescroller/inc/math.sibilant:3:0 */

    return (Math.floor((Math.random() * (255 - 0))) + 0);
});
var setColor = (function setColor$(r, g, b, a, vert) {
    /* set-color src/client/sidescroller/inc/vertex.sibilant:2:0 */

    vert.color.r = r;
    vert.color.g = g;
    vert.color.b = b;
    return vert.color.a = a;
});
var setPoint = (function setPoint$(x, y, z, vert) {
    /* set-point src/client/sidescroller/inc/vertex.sibilant:9:0 */

    vert.point.x = x;
    vert.point.y = y;
    return vert.point.z = z;
});
var Group = Interface.define("Group", {
    init(_list = create(List)(), _members = (new Map())) {

        this._list = _list;
        this._members = _members;
        return this;

    },
    get size() {

        return this._list.length;

    },
    get length() {

        return this._list.length;

    },
    create() {

        "create an empty group instance";
        return create(this)(...arguments);

    },
    of (...items) {

        "create a new group instance with a variable number\n" + "of arguements,regardless of the number or type of arguements.\n" + "See the native `Array.of` static method.";
        var list = List.from(items);
        return create(this)(list);

    },
    from(items = this.items, fn = ((a) => {

        return a;

    })) {

        "create a new group instance from an array like, or iterable object.";
        return create(this)(List.from(Array.from(items).map(fn)));

    },
    pop(_list = this._list, _members = this._members) {

        "remove and return the element last in the groups ordering.";
        return (function(item) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            _members.delete(item);
            return item;
        })(_list.pop());

    },
    push(value = this.value) {

        return "Add an element to the end of the groups ordering.";

    },
    each(f = this.f, _list = this._list) {

        "Call the given function on every element of the group, returning the group which is being itterated on";
        _list.each(f);
        return this;

    },
    add(member = this.member, _list = this._list, _members = this._members) {

        "Add an value to the group, unless the group already has that member.";
        return (function() {
            if (!(_members.has(member))) {
                return (function(node) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _members.set(member, node);
                    _list.pushNode(node);
                    return node;
                })(_list.node(member));
            }
        }).call(this);

    },
    has(member = this.member, _members = this._members) {

        "Check if the group has the given member, returning true if yes, and false if no.";
        return _members.has(member);

    },
    remove(member = this.member, _list = this._list, _members = this._members) {

        "Remove a specific member from the group.";
        return (function(node) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            (function() {
                if (node) {
                    _list.removeNode(node);
                    return _members.delete(member);
                }
            }).call(this);
            return node;
        })(_members.get(member));

    }
});
(function(group, testData) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

    group.add(testData[0]);
    assert(group._list.length === 1, "length of list was not changed after addition");
    assert(group.has(testData[0]), "method `has` does not accurately detect membership");
    group.remove(testData[0]);
    assert(group._list.length === 0, "length of list was not changed after removal");
    return console.log("all group tests pass.");
})(create(Group)(), (new Array(10)).map(((nil, i) => {

    return {
        value: i
    };

})));
var _assignId = ((m, k) => {

    m.id = k;
    return m;

});
var ObjectPool = Interface.define("ObjectPool", {
    init(size = this.size, _interface = null, _array = (function(array) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < size; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    return array.push((function() {
                        /* src/client/sidescroller/object-pool.sibilant:33:46 */

                        return Object.create(_interface);
                    }).call(this));
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    })([]), _members = Group.from(_array), _available = Group.from(_array), _inUse = Group.create()) {

        this.size = size;
        this._interface = _interface;
        this._array = _array;
        this._members = _members;
        this._available = _available;
        this._inUse = _inUse;
        _array.each(_assignId);
        return this;

    },
    pools: (new Map()),
    get free() {

        return this._available.size;

    },
    get used() {

        return this._inUse.size;

    },
    get total() {

        return this._members.size;

    },
    clear(size = this.size, _interface = this._interface, _array = this._array, _inUse = this._inUse) {

        _inUse.each(((o) => {

            return o.clear();

        }));
        return this.init(size, _interface, _array);

    },
    aquire(_available = this._available, _members = this._members, _inUse = this._inUse) {

        "remove an object from the collection of available ones,\n" + "adding it to the collection of objects currently in use,\n" + "and return it to the caller.";
        return (function(member) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            _inUse.add(member);
            return member;
        })(_available.pop());

    },
    release(obj = this.obj, _available = this._available, _members = this._members, _inUse = this._inUse) {

        "take an object that is a member of this pool, and remove it\n" + "from the collection of in use objects, and adding it to the collection of\n" + "available ones, for later use";
        _inUse.remove(obj);
        return _available.add(obj);

    }
});
(function(i) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

    return (function(pool) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        console.log(pool);
        return console.log("aquired value", pool.aquire());
    })(create(ObjectPool)(1000, {}));
})(0);
var despawned = (($fpipe) => {

    return $fpipe.despawn();

});
var PooledSystem = Interface.define("PooledSystem", {
    init(limit = this.limit, interface = this.interface, _pool = create(ObjectPool)(limit, interface)) {

        this.limit = limit;
        this.interface = interface;
        this._pool = _pool;
        this.register(interface);
        return this;

    },
    limit: 10000,
    systems: (new Map()),
    clear(_pooled = this._pooled) {

        _pooled.each(feach(despawned));
        return _pooled.clear();

    },
    spawn(...args) {

        "aquire an object from the systems pool, and initialize it.";
        return (function(r) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            r.init(...args);
            return r;
        })(this._pool.aquire());

    },
    despawn(obj) {

        "remove an object from the system, and release it back into the pool.";
        obj.clear();
        return this._pool.release(obj);

    },
    register(interface) {

        "Associate an interface with a system,and add the system to the collection of all active systems.";
        interface.system = this;
        return this.systems.set(this, this);

    },
    update() {

        "update every active member of the system";
        return this._pool._inUse.each(((member) => {

            return member.update();

        }));

    }
});
require("webgl/lib/ext/window");
var {
    Buffer,
    Program,
    Shader,
    Attribute,
    Type,
    Context,
    Uniform
} = require("webgl/lib/webgl/gl"), {
    BlendMode
} = require("webgl/lib/math/color.js");
var feach = R.curry(((f, a) => {

    return a.each(f);

}));
var Andy = {
    Gl: require("webgl/lib/webgl/gl"),
    Color: require("webgl/lib/math/color.js")
};
Andy.Color.RGBA = Andy.Gl.Type.RGBA;
Andy.ubyte = Andy.Gl.Type.ubyte;
Andy.Type = Andy.Gl.Type;
mixin([Andy.Gl, Andy.Color], Andy);
var bound = (function() {
        /* src/client/sidescroller/systems/rendering/header.sibilant:25:11 */

        return arguments[0].bind();
    }),
    clear = (function() {
        /* src/client/sidescroller/systems/rendering/header.sibilant:26:11 */

        return arguments[0].clear();
    }),
    rendered = (function() {
        /* src/client/sidescroller/systems/rendering/header.sibilant:27:14 */

        return arguments[0].render();
    }),
    unbound = (function() {
        /* src/client/sidescroller/systems/rendering/header.sibilant:29:13 */

        return arguments[0].unbind();
    }),
    disabled = (function() {
        /* src/client/sidescroller/systems/rendering/header.sibilant:30:14 */

        return arguments[0].disable();
    }),
    enabled = (function() {
        /* src/client/sidescroller/systems/rendering/header.sibilant:32:13 */

        return arguments[0].enable();
    });
var Gl = {};
Gl.shader = (function Gl$shader$(typeName, string, context) {
    /* Gl.shader src/client/sidescroller/systems/rendering/gl.sibilant:3:0 */

    return (new Andy.Gl.Shader(Andy.Gl.Shader[typeName], string));
});
Gl.buffer = (function Gl$buffer$(_members, context) {
    /* Gl.buffer src/client/sidescroller/systems/rendering/gl.sibilant:6:0 */

    return (new Andy.Gl.Buffer(context.ARRAY_BUFFER, context.DYNAMIC_DRAW)).bind().data(_members.data).unbind();
});
Gl.context = (function Gl$context$(dimensions, blend) {
    /* Gl.context src/client/sidescroller/systems/rendering/gl.sibilant:12:0 */

    return (new Andy.Context()).makeCurrent().resize(...dimensions).clearColor(0, 0, 0, 0).blend(blend).clear();
});
Gl.uniform = (function Gl$uniform$(typeName, varName, value) {
    /* Gl.uniform src/client/sidescroller/systems/rendering/gl.sibilant:20:0 */

    return (new Andy.Gl.Uniform[typeName](varName, value));
});
var uniforms = {
    res: Gl.uniform("Vector2", "Resolution", window.size()),
    scale: Gl.uniform("Float", "Scale", 1)
};
Gl.program = (function Gl$program$(vert, frag, context) {
    /* Gl.program src/client/sidescroller/systems/rendering/gl.sibilant:32:0 */

    return (new Andy.Gl.Program(Gl.shader("vertex", vert, context), Gl.shader("fragment", frag, context)));
});
var Renderable = Interface.define("Renderable", {
    init(layer = this.layer, structure = this.structure) {

        this.layer = layer;
        this.structure = structure;
        return this;

    }
});
var Layer = Interface.define("Layer", {
    init(limit = this.limit, interface = Renderable, uniform = [], shaders = [], context = this.context, program = Gl.program(shaders[0], shaders[1], context), _members = interface.structure.Array(limit), buffer = Gl.buffer(_members, context)) {

        this.limit = limit;
        this.interface = interface;
        this.uniform = uniform;
        this.shaders = shaders;
        this.context = context;
        this.program = program;
        this._members = _members;
        this.buffer = buffer;
        PooledSystem.init.call(this, limit, interface, create(ObjectPool)(limit, interface, _members));
        this.rendering.layers.push(this);
        return this;

    },
    extend: PooledSystem,
    spawn() {

        return this._pool.aquire();

    },
    despawn(o) {

        return this._pool.release(o);

    },
    clear(buffer = this.buffer, _members = this._members, context = this.context) {

        return buffer.bind().data(_members.data).unbind();

    },
    enable(buffer = this.buffer, uniform = this.uniform, program = this.program, context = this.context) {

        buffer.bind();
        program.enable();
        uniform.each(enabled);
        return this.interface.structure.enableGlAttributes();

    },
    disable(buffer = this.buffer, uniform = this.uniform, program = this.program) {

        program.disable();
        return buffer.unbind();

    },
    draw(context = this.context) {

        return (function() {
            if (!(this._pool.used === 0)) {
                console.log("drawing");
                return context.draw(context.POINTS, (this._pool.size - this._pool.used), this._pool.used);
            }
        }).call(this);

    },
    render() {

        this.clear();
        this.enable();
        this.draw();
        return this.disable();

    }
});
var defGlsl = (function defGlsl$(outType, name, inTypes, ...body) {
    /* def-glsl src/client/sidescroller/systems/rendering/shader.sibilant:2:0 */

    return (function(shader) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        console.log("shader", shader);
        return shader;
    })([outType, name, "(", inTypes.join(","), ")", "{\n", ...body, "}"].join(" "));
});
var vertShader = (function vertShader$() {
    /* vert-shader src/client/sidescroller/systems/rendering/shader.sibilant:10:0 */

    return ("#version 300 es\n" + "in vec3 a_point;\n" + "in vec4 a_color;\n" + "in float a_size;\n" + "\n" + "out highp vec4 vColor;\n" + "\n" + "uniform vec2  u_Resolution;\n" + "uniform float u_Scale;" + defGlsl("vec4", "clipspace_coordinate", ["vec3 xyz", "float scale", "vec2 res"], "return vec4( (xyz * vec3(1.0,1.0,1.0) * scale) /", "(vec3(res,1.0)) * 1.98 - 0.99, 1.0) * vec4( 1.0,-1.0,1.0,1.0 ); ") + defGlsl("void", "main", ["void"], ("gl_Position  = clipspace_coordinate( a_point, u_Scale, u_Resolution );\n" + "              gl_PointSize = a_size;\n" + "//size * z\n" + "// so that the closer the vertex is (the larger z is), the larger the vertex will be relative to its physical size\n" + "\n" + "\n" + "              vColor       = a_color; ")));
});
var fragmentShaderString = ("#version 300 es\n" + "precision mediump float;\n" + "\n" + "in  vec4 vColor;\n" + "out vec4 FragColor;\n" + "\n" + "void main(void)\n" + "{\n" + " FragColor = vColor;\n" + "           }");
var ScalingVertex = Interface.define("ScalingVertex", {
    init(layer = this.layer) {

        this.layer = layer;
        return this;

    },
    extend: Renderable,
    clear() {

    },
    structure: (new Andy.Gl.Type.Composite({
        point: Andy.Type.Vector3,
        color: Andy.Color.RGBA,
        size: Andy.Type.float
    }))
});
var Rendering = Interface.define("Rendering", {
    init(dimensions = window.size(), limit = 100, blend = true, context = Gl.context(dimensions, blend), layers = []) {

        this.dimensions = dimensions;
        this.limit = limit;
        this.blend = blend;
        this.context = context;
        this.layers = layers;
        console.log("initialziing rendering system", this);
        this.interface.context = context;
        this.interface.rendering = this;
        context.gl.enable(context.gl.BLEND);
        context.gl.blendEquation(context.gl.FUNC_ADD);
        context.gl.blendFuncSeparate(context.gl.SRC_ALPHA, context.gl.ONE_MINUS_SRC_ALPHA, context.gl.ONE, context.gl.ONE_MINUS_SRC_ALPHA);
        PooledSystem.init.call(this, limit);
        console.log("done initializing rendering system", this);
        return this;

    },
    extend: PooledSystem,
    set backgroundColor({
        r,
        g,
        b,
        a
    }) {

        return this.context.makeCurrent().clearColor(...Scalar.div([r, g, b, a], 255));

    },
    interface: Layer,
    resize([width, height] = [this.width, this.height], context = this.context) {

        return context.resize(width, height);

    },
    load({
        dimensions,
        limit,
        blend
    }) {

        return create(Rendering)(dimensions, limit, blend);

    },
    update(layers = this.layers, context = this.context) {

        "render each visible dot to the screen";
        return layers.each(rendered);

    }
});
var laggedTicks = 0;
var handleLag = (function handleLag$(handleLag = (() => {



})) {
    /* handle-lag eval.sibilant:105:0 */

    return (function() {
        if (Ticker.elapsed > Ticker.rate) {
            return handleLag();
        } else {
            return laggedTicks = 0;
        }
    }).call(this);
});
var Vertex = Interface.define("Vertex", {
    init(layer = this.layer) {

        this.layer = layer;
        return this;

    },
    extend: Renderable,
    structure: (new Andy.Gl.Type.Composite({
        point: Andy.Type.Vector3,
        color: Andy.Color.RGBA,
        size: Andy.Type.float
    }))
});
var Scalar = Interface.define("Scalar", {
    init(value = this.value) {

        this.value = value;
        return this;

    },
    mul(array = this.array, value = this.value) {

        return array.map((function() {
            /* eval.sibilant:122:16 */

            return (arguments[0] * value);
        }));

    },
    div(array = this.array, value = this.value) {

        return array.map((function() {
            /* eval.sibilant:124:16 */

            return (arguments[0] / value);
        }));

    },
    sub(array = this.array, value = this.value) {

        return array.map((function() {
            /* eval.sibilant:126:16 */

            return (arguments[0] - value);
        }));

    }
});
const rendering = Rendering.load({
    size: Scalar.sub(window.size(), 8),
    limit: 100,
    blend: true
});
rendering.resize(Scalar.sub(window.size(), 4));
rendering.backgroundColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 150
};
var wrap = DocumentNode.wrap;
var stage = createDocumentNode("div", {
    id: "stage"
}, []);
var container = createDocumentNode("div", {
    id: "container"
}, [rendering.context.canvas]);
createDocumentNode("div", {
    id: "frame"
}, [container]).render(DocumentRoot);
var spawnVertexLayer = (function spawnVertexLayer$() {
    /* spawn-vertex-layer src/client/sidescroller/systems/test.sibilant:2:0 */

    return rendering.spawn(1000000, Vertex, [uniforms.res, uniforms.scale], [vertShader(), fragmentShaderString]);
});
var assert = require("assert");
var nothing = null;
var freeSpace = (function freeSpace$(pool) {
    /* free-space src/client/sidescroller/pools/dynamic.sibilant:2:0 */

    return pool.free;
});
var sumOf = (function sumOf$(list, f) {
    /* sum-of src/client/sidescroller/pools/dynamic.sibilant:3:0 */

    return list.map();
});
List.reduce = (function List$reduce$(f, r) {
    /* List.reduce src/client/sidescroller/pools/dynamic.sibilant:4:0 */

    this.each(((e, i, l) => {

        return r = f(r, e, i, l);

    }));
    return r;
});
List.findNode = (function List$findNode$(f = this.f, node = this.head) {
    /* List.find-node src/client/sidescroller/meta/misc.sibilant:15:8 */

    return (function() {
        if (f(node)) {
            return node;
        } else if (!(node === this.tail)) {
            return List.find(f, node.next);
        } else {
            return false;
        }
    }).call(this);
});
List.find = (function List$find$(f = this.f, node = this.head) {
    /* List.find src/client/sidescroller/meta/misc.sibilant:15:8 */

    var r = List.findNode(f, node);
    return (function() {
        if (r) {
            return r.value;
        } else {
            return false;
        }
    }).call(this);
});
List.rotate = (function List$rotate$() {
    /* List.rotate src/client/sidescroller/pools/dynamic.sibilant:15:0 */

    return (function() {
        /* src/client/sidescroller/systems/ecs.sibilant:4:8 */

        this.push(this.shift());
        return this;
    }).call(this);
});
List.rotateUntil = (function List$rotateUntil$(predicate = this.predicate, t = 0) {
    /* List.rotate-until src/client/sidescroller/meta/misc.sibilant:15:8 */

    return (function() {
        if (predicate(this.head.item)) {
            return this.head.item;
        } else if (!(t > this.size)) {
            return this.rotate().rotateUntil(predicate, ++(t));
        } else {
            return false;
        }
    }).call(this);
});
var DynamicPool = Interface.define("DynamicPool", {
    bucketSize: 256,
    init(interface = this.interface, bucketSize = this.bucketSize, buckets = List.of(create(ObjectPool)(this.bucketSize, interface))) {

        this.interface = interface;
        this.bucketSize = bucketSize;
        this.buckets = buckets;
        return this;

    },
    get current() {

        return this.buckets.head.item;

    },
    get size() {

        return sumOf(this.buckets, freeSpace);

    },
    grow(buckets = this.buckets, bucketSize = this.bucketSize, self = this) {

        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:10:8 */

            var newPool = create(ObjectPool)(bucketSize, this.interface);
            buckets.unshift(newPool);
            return newPool;
        }).call(this);

    },
    adjust(buckets = this.buckets) {

        var p = buckets.rotateUntil((function() {
            /* src/client/sidescroller/pools/dynamic.sibilant:42:34 */

            return arguments[0].free > 0;
        }));
        return (p) ? p : this.grow();

    },
    aquire(buckets = this.buckets) {

        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:10:8 */

            var object = (function() {
                if (this.current.free) {
                    return this.current.aquire();
                } else {
                    return this.adjust().aquire();
                }
            }).call(this);
            object.bucket = this.current;
            return object;
        }).call(this);

    },
    release(object = this.object, buckets = this.buckets) {

        return object.bucket.release(object);

    },
    clear(buckets = this.buckets) {

        var self = this;
        return buckets.each((function() {
            /* src/client/sidescroller/pools/dynamic.sibilant:58:19 */

            return arguments[0]._inUse.each((function() {
                /* src/client/sidescroller/pools/dynamic.sibilant:58:46 */

                return self.despawn(arguments[0]);
            }));
        }));

    },
    spawn(...args) {

        "aquire an object from the systems pool, and initialize it.";
        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:10:8 */

            var r = this.aquire();
            console.log("spawning", r);
            console.log("with init", r.init);
            r.init(...args);
            return r;
        }).call(this);

    },
    despawn(obj) {

        "remove an object from the system, and release it back into the pool.";
        obj.clear();
        return this.release(obj);

    },
    register(interface) {

        "Associate an interface with a system,and add the system to the collection of all active systems.";
        return interface.pool = this;

    }
});
var Component = Interface.define("Component", {
    register() {

    },
    init(entity = this.entity, data = this.data, system = this.system) {

        this.entity = entity;
        this.data = data;
        this.system = system;
        this.register();
        return this;

    }
});
var ComponentSystem = Interface.define("ComponentSystem", {
    interface: Component,
    register() {

    },
    init(game = this.game, interface = this.interface, components = create(OrderedMap)(), pool = create(DynamicPool)(interface), thread = Promise.resolve()) {

        this.game = game;
        this.interface = interface;
        this.components = components;
        this.pool = pool;
        this.thread = thread;
        this.register();
        return this;

    },
    get system() {

        return this;

    },
    template: false,
    build() {

        console.log("building component system", this);
        return (function() {
            if (!((this.template))) {
                return this.init();
            }
        }).call(this);

    },
    clear(pool = this.pool, components = this.components, entity = this.entity) {

        components.delete(entity);
        return pool.clear();

    },
    get(entity = this.entity, components = this.components) {

        return components.get(entity);

    },
    spawn(entity = this.entity, data = this.data, pool = this.pool, components = this.components) {

        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:10:8 */

            var c = pool.spawn(entity, data, this);
            components.set(entity, c);
            return c;
        }).call(this);

    },
    _updateComponent(component, t) {

        throw (new Error("need to override *update-component on sub classes of component system"))

    },
    _updateAll(t = this.t, components = this.components) {

        return components.each((($fpipe) => {

            return this._updateComponent($fpipe, t);

        }));

    },
    update(t) {

        return this.thread = this.thread.then(((nil) => {

            return this._updateAll(t);

        }));

    }
});
var Entity = Interface.define("Entity", {
    doc: "used as a key to retrieve related components from different systems.",
    init(id = this.id, aspects = this.aspects, data = this.data, components = data.map(((d, i) => {

        return aspects[i].spawn(this, d);

    }))) {

        this.id = id;
        this.aspects = aspects;
        this.data = data;
        this.components = components;
        return this;

    },
    clear() {

        this.components.each(((c) => {

            return c.system.clear(this);

        }));
        return this.id = null;

    },
    spawn(aspects, data) {

        return EntitySystem.spawn(aspects, data);

    }
});
var EntitySystem = Interface.define("EntitySystem", {
    currentId: 0,
    init(pool = create(DynamicPool)(Entity, 256)) {

        this.pool = pool;
        return this;

    },
    clear() {

        return this.pool.clear();

    },
    spawn(aspects, data) {

        return this.pool.spawn(((this.currentId) ++), aspects, data);

    }
});
var EntityGroup = Interface.define("EntityGroup", {
    init(name = this.name, aspects = this.aspects, system = this.system, group = create(Group)()) {

        this.name = name;
        this.aspects = aspects;
        this.system = system;
        this.group = group;
        return this;

    },
    clear() {

        return group.each(((e) => {

            return e.clear();

        }));

    },
    spawn(data = this.data, aspects = this.aspects, system = this.system, group = this.group) {

        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:10:8 */

            var e = system.spawn(aspects, data);
            group.add(e);
            return e;
        }).call(this);

    }
});
var PositionInterface = Component.define("PositionInterface", {
    get x() {

        return this.data.x;

    },
    set x(x) {

        return this.data.x = x;

    },
    get y() {

        return this.data.y;

    },
    set y(y) {

        return this.data.y = y;

    }
});
var Position = ComponentSystem.define("Position", {
    interface: PositionInterface,
    shift(entity, [xshift, yshift]) {

        var c = this.get(entity);
        c.x = (c.x + xshift);
        c.y = (c.y + yshift);
        return this._updateComponent(c);

    },
    move(entity, {
        x,
        y
    }) {

        var c = this.get(entity);
        c.x = x;
        c.y = y;
        return this._updateComponent(c);

    },
    _updateComponent(c) {

        (function() {
            if (c.x < 0) {
                return c.x = (c.x + rendering.dimensions[0]);
            }
        }).call(this);
        (function() {
            if (c.y < 0) {
                return c.y = (c.y + rendering.dimensions[1]);
            }
        }).call(this);
        c.x = (c.x % rendering.dimensions[0]);
        return c.y = (c.y % rendering.dimensions[1]);

    }
});
var VelocityInterface = Component.define("VelocityInterface", {
    get displacement() {

        return this.data;

    },
    get xd() {

        return this.displacement[0];

    },
    get yd() {

        return this.displacement[1];

    },
    set xd(v) {

        return this.data[0] = v;

    },
    set yd(v) {

        return this.data[1] = v;

    },
    get pos() {

        return Position.get(this.entity);

    },
    accelerate([v1, v2]) {

        this.xd += v1;
        this.yd += v2;
        return this;

    }
});
var Velocity = ComponentSystem.define("Velocity", {
    interface: VelocityInterface,
    _updateComponent(m) {

        var p = m.pos,
            xd = m.data[0],
            yd = m.data[1];
        m.moved = false;
        return (function() {
            if (!((xd === 0 && yd === 0))) {
                m.moved = true;
                this.game.events.emit("move", m);
                p.x = Math.floor((p.x + (xd * (game.ticker.elapsed / 1000))));
                return p.y = Math.floor((p.y + (yd * (game.ticker.elapsed / 1000))));
            }
        }).call(this);

    }
});
var DotInterface = Component.define("DotInterface", {
    get color() {

        return this.data;

    },
    get pos() {

        return Position.get(this.entity);

    },
    get scale() {

        return Physics.get(this.entity).scale;

    },
    get vertex() {

        return this.data.vertex;

    }
});
var vertexLayer = (function vertexLayer$(limit) {
    /* vertex-layer src/client/sidescroller/systems/components/dot.sibilant:7:0 */

    return rendering.spawn(limit, Vertex, [uniforms.res, uniforms.scale], [vertShader(), fragmentShaderString]);
});
var Dot = ComponentSystem.define("Dot", {
    verts: vertexLayer(100000),
    interface: DotInterface,
    spawn(entity, data) {

        data.vertex = this.verts.spawn();
        var c = ComponentSystem.spawn.call(this, entity, data);
        return c;

    },
    _updateComponent(dot) {

        dot.vertex.point.x = dot.pos.x;
        dot.vertex.point.y = dot.pos.y;
        dot.vertex.point.z = 0;
        dot.vertex.size = dot.scale;
        dot.vertex.color.r = dot.color.r;
        dot.vertex.color.g = dot.color.g;
        dot.vertex.color.b = dot.color.b;
        return dot.vertex.color.a = dot.color.a;

    }
});
var Agency = Component.define("Agency", {

});
var Agent = ComponentSystem.define("Agent", {
    interface: Agency
});
var MatrixMap = Interface.define("MatrixMap", {
    init(dim = this.dim, array = []) {

        this.dim = dim;
        this.array = array;
        return this;

    },
    extend: Matrix,
    get([x, y]) {

        return Matrix.get.call(this, x, y);

    },
    set([x, y], v) {

        return Matrix.get.call(this, x, y, v);

    },
    has([x, y]) {

        return (function() {
            if (this.get([x, y])) {
                return true;
            } else {
                return false;
            }
        }).call(this);

    },
    get width() {

        return this.dim[0];

    },
    get height() {

        return this.dim[1];

    },
    each(f = this.f, width = this.width, height = this.height) {

        "standard itterative operator, accepts a function and applies it to every\n" + "element of the matrix";
        var r = this;
        for (var i = 0; i < width; ++(i)) {
            for (var j = 0; j < height; ++(j)) {
                f(r.get([i, j]), [i, j], r)
            }

        };
        return r;

    }
});
var CollisionBounds = Component.define("CollisionBounds", {
    get dimensions() {

        return this.data.area;

    },
    get dim() {

        return this.dimensions;

    },
    get type() {

        return this.data.type;

    },
    get scale() {

        return (this.physics.scale / 2);

    },
    get physics() {

        return Physics.get(this.entity);

    },
    get minBounds() {

        var height = this.scale,
            width = this.scale;
        var {
            x,
            y
        } = this.pos;
        return {
            x: (x - width),
            y: (y - height)
        };

    },
    get maxBounds() {

        var height = this.scale,
            width = this.scale;
        var {
            x,
            y
        } = this.pos;
        return {
            x: (x + width),
            y: (y + height)
        };

    },
    get position() {

        return Position.get(this.entity);

    },
    get pos() {

        return this.position;

    },
    get velocity() {

        return Velocity.get(this.entity);

    }
});
var Collision = ComponentSystem.define("Collision", {
    interface: CollisionBounds,
    _check: R.curry((function(c, c_) {
        /* src/client/sidescroller/systems/components/collision.sibilant:7:28 */

        return (function() {
            if (!((c_.checked || c === c_ || c.type === "static"))) {
                var d = [(c_.minBounds.x - c.maxBounds.x), (c_.minBounds.y - c.maxBounds.y), (c.minBounds.x - c_.maxBounds.x), (c.minBounds.y - c_.maxBounds.y)];
                var d1x = d[0],
                    d1y = d[1],
                    d2x = d[2],
                    d2y = d[3];
                c.colliding = false;
                return (function() {
                    if (!((d1x >= 0 || d1y >= 0 || d2x >= 0 || d2y >= 0))) {
                        c.colliding = true;
                        return this.game.events.emit("collision", [c, c_, d]);
                    }
                }).call(this);
            }
        }).call(this);
    })),
    _updateComponent(c) {

        return (function() {
            if (!((c.type === "static" || c.colliding))) {
                Collision.components.each(this._check(c));
                return c.checked = true;
            }
        }).call(this);

    }
});
var PhysicalProperties = Component.define("PhysicalProperties", {
    get mass() {

        return this.data.mass;

    },
    get scale() {

        return this.data.scale;

    },
    get volume() {

        return this.scale;

    },
    get height() {

        return this.data.height;

    },
    get width() {

        return this.data.width;

    },
    get density() {

        return (this.mass / this.volume);

    },
    get speed() {

        return this.data.speed;

    },
    get velocity() {

        return Velocity.get(this.entity);

    },
    get forces() {

        return this.data.forces;

    },
    get position() {

        return Position.get(this.entity);

    },
    get location() {

        return this.position;

    }
});
var Physics = ComponentSystem.define("Physics", {
    interface: PhysicalProperties,
    _forces: [],
    get forces() {

        return this._forces;

    },
    _updateComponent(c) {

        return c.forces.each((function() {
            /* src/client/sidescroller/systems/components/physics.sibilant:23:20 */

            return arguments[0].apply(c);
        }));

    }
});
Physics.Force = Interface.define("Physics.Force", {
    build() {

        console.log("building force", this.name === "Physics.Force", this);
        return (function() {
            if (!(this.name === "Physics.Force")) {
                console.log("adding force", this, Physics.forces);
                Physics.forces.push(this);
                return console.log("done adding force", Physics.forces);
            }
        }).call(this);

    },
    apply(physicalProperties = this.physicalProperties) {

        throw (new Error("force does not have an applicator.")())

    }
});
var Gravity = Physics.Force.define("Gravity", {
    apply(c) {

        var v = c.velocity;
        var collision = Collision.get(c.entity);
        return (function() {
            if (!(collision.colliding)) {
                console.log("not colliding, applying gravity");
                return v.yd += 9.8;
            }
        }).call(this);

    }
});
var Friction = Physics.Force.define("Friction", {
    apply(c) {

        var v = c.velocity;
        var collision = Collision.get(c.entity);
        return (function() {
            if (!(collision.colliding)) {
                console.log("not colliding, applying friction.");
                v.xd += (-1 * (v.xd / 32));
                return v.yd += (-1 * (v.yd / 32));
            }
        }).call(this);

    }
});
var jimp = require("jimp");
var Pixel = Interface.define("Pixel", {
    init(x = this.x, y = this.y, image = this.image, tuple = (function(array) {
        /* src/client/sidescroller/systems/components/sprite.sibilant:12:15 */

        (function() {
            /* src/client/sidescroller/meta/macros.sibilant:27:8 */

            var $for = null;
            for (var i = 0; i < 4; ++(i)) {
                $for = (function() {
                    /* src/client/sidescroller/meta/macros.sibilant:29:35 */

                    array.push((function() {
                        /* src/client/sidescroller/systems/components/sprite.sibilant:16:46 */

                        return image.bitmap.data[(image.getPixelIndex(x, y) + i)];
                    }).call(this));
                    return array;
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    }).call(this, [])) {

        this.x = x;
        this.y = y;
        this.image = image;
        this.tuple = tuple;
        return this;

    },
    get r() {

        return this.tuple[0];

    },
    get g() {

        return this.tuple[1];

    },
    get b() {

        return this.tuple[2];

    },
    get a() {

        return this.tuple[3];

    }
});
var MatrixMap = Interface.define("MatrixMap", {
    init(dim = this.dim, array = []) {

        this.dim = dim;
        this.array = array;
        return this;

    },
    extend: Matrix,
    get([x, y]) {

        return Matrix.get.call(this, x, y);

    },
    set([x, y], v) {

        return Matrix.get.call(this, x, y, v);

    },
    has([x, y]) {

        return (function() {
            if (this.get([x, y])) {
                return true;
            } else {
                return false;
            }
        }).call(this);

    },
    get width() {

        return this.dim[0];

    },
    get height() {

        return this.dim[1];

    },
    each(f = this.f, width = this.width, height = this.height) {

        "standard itterative operator, accepts a function and applies it to every\n" + "element of the matrix";
        var r = this;
        for (var i = 0; i < width; ++(i)) {
            for (var j = 0; j < height; ++(j)) {
                f(r.get([i, j]), [i, j], r)
            }

        };
        return r;

    }
});
var Image = Interface.define("Image", {
    init(image = this.image, pixelMap = create(MatrixMap)([image.bitmap.width, image.bitmap.height])) {

        this.image = image;
        this.pixelMap = pixelMap;
        return this;

    },
    get bitmap() {

        return this.image.bitmap.data;

    },
    get create() {

        return ((image) => {

            return create(this)(image);

        });

    },
    load(path) {

        return jimp.read(path).then(Image.create);

    },
    loadList(...paths) {

        return Promise.all(fmap((function() {
            /* src/client/sidescroller/systems/components/sprite.sibilant:42:18 */

            return jimp.read(arguments[0]);
        }), paths)).then(fmap(Image.create));

    },
    get([x, y] = [this.x, this.y], bitmap = this.bitmap) {

        var self = this;
        return (function() {
            if (self.pixelMap.has([x, y])) {
                return self.pixelMap.get([x, y]);
            } else {
                var r = (function() {
                    /* src/client/sidescroller/systems/components/sprite.sibilant:8:20 */

                    return create(Pixel)(x, y, this.image);
                }).call(this);
                self.pixelMap.set([x, y], r);
                return r;
            }
        }).call(this);

    },
    scan(f = this.f, image = this.image, bitmap = this.bitmap) {

        return (function() {
            /* src/client/sidescroller/meta/macros.sibilant:27:8 */

            var $for = null;
            for (var x = 0; x > image.width; ++(x)) {
                $for = (function() {
                    /* src/client/sidescroller/meta/macros.sibilant:29:35 */

                    return (function() {
                        /* src/client/sidescroller/meta/macros.sibilant:27:8 */

                        var $for = null;
                        for (var y = 0; y > image.width; ++(y)) {
                            $for = (function() {
                                /* src/client/sidescroller/meta/macros.sibilant:29:35 */

                                return f(this.get([x, y]), [x, y], this);
                            }).call(this);
                        };
                        return $for;
                    }).call(this);
                }).call(this);
            };
            return $for;
        }).call(this);

    }
});
var SpriteInterface = Component.define("SpriteInterface", {
    register(dim = this.dim, system = this.system) {

        return this.verts = create(MatrixMap)(dim, (function(array) {
            /* src/client/sidescroller/systems/components/sprite.sibilant:12:15 */

            (function() {
                /* src/client/sidescroller/meta/macros.sibilant:27:8 */

                var $for = null;
                for (var i = 0; i < productOf(dim); ++(i)) {
                    $for = (function() {
                        /* src/client/sidescroller/meta/macros.sibilant:29:35 */

                        array.push((function() {
                            /* src/client/sidescroller/systems/components/sprite.sibilant:16:46 */

                            return system.verts.spawn();
                        }).call(this));
                        return array;
                    }).call(this);
                };
                return $for;
            }).call(this);
            return array;
        }).call(this, []));

    },
    frameId: 0,
    delay: 1,
    get pos() {

        return Position.get(this.entity);

    },
    get dim() {

        return this.data.dim;

    },
    get image() {

        return Promise.resolve(this.data.image);

    },
    get frameCount() {

        return this.data.frameCount;

    },
    get scale() {

        return this.data.scale;

    },
    get orientation() {

        return this.data.orientation;

    },
    get height() {

        return this.dim[1];

    },
    get width() {

        return this.dim[0];

    },
    get x() {

        return this.pos.x;

    },
    get y() {

        return this.pos.y;

    },
    getFramePixel(i = this.i, j = this.j, bitMap = this.bitMap, width = this.width, frameId = this.frameId, frameCount = this.frameCount, image = this.image) {

        return bitMap.get([(i + (width * (frameId % frameCount))), j]);

    },
    moveVertex(i = this.i, j = this.j, scale = this.scale, v = this.v, pos = this.pos, height = this.height, width = this.width, orientation = this.orientation) {

        v.point.x = (((pos.x - ((width * scale * orientation[0]) / 2)) + (i * scale * orientation[0])) % rendering.dimensions[0]);
        v.point.y = (((pos.y - ((height * scale * orientation[1]) / 2)) + (j * scale * orientation[1])) % rendering.dimensions[1]);
        return v.point.z = 0;

    },
    setColor(v, pixel) {

        v.color.r = pixel.r;
        v.color.g = pixel.g;
        v.color.b = pixel.b;
        return v.color.a = pixel.a;

    },
    step() {

        return this.frameId = ((this.frameId + 1) % this.frameCount);

    },
    draw(t = this.t, verts = this.verts, image = this.image, scale = this.scale, frameId = this.frameId, frameCount = this.frameCount, pos = this.pos, height = this.height, width = this.width) {

        return image.then(((bitMap) => {

            return verts.each(((v, [i, j]) => {

                var pixel = this.getFramePixel(i, j, bitMap);
                this.moveVertex(i, j, scale, v);
                v.size = scale;
                return this.setColor(v, pixel);

            }));

        }));

    }
});
var Sprite = ComponentSystem.define("Sprite", {
    verts: rendering.spawn(1000000, Vertex, [uniforms.res, uniforms.scale], [vertShader(), fragmentShaderString]),
    interface: SpriteInterface,
    _updateComponent(sprite, t) {

        return sprite.draw(t);

    }
});
var Mousetrap = require("mousetrap");
var Keyboard = Interface.define("Keyboard", {
    on([key, state], f) {

        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:4:8 */

            Mousetrap.bind(key, f, ("key" + state));
            return this;
        }).call(this);

    },
    once([key, stateName], f) {

        return (function() {
            /* src/client/sidescroller/systems/ecs.sibilant:4:8 */

            var keyState = ("key" + stateName);
            Mousetrap.bind(key, f, (() => {

                f();
                return Mousetrap.unbind(key, keyState);

            }), keyState);
            return this;
        }).call(this);

    }
});
Keyboard.Controlled = Component.define("Keyboard.Controlled", {
    get velocity() {

        return Velocity.get(this.entity);

    },
    get sprite() {

        return Sprite.get(this.entity);

    }
});
Keyboard.Controller = ComponentSystem.define("Keyboard.Controller", {
    interface: Keyboard.Controlled,
    _updateComponent(c) {

    }
});
var bindPlayerVelocityKey = (function bindPlayerVelocityKey$(key_d_s$10) {
    /* bind-player-velocity-key src/client/sidescroller/systems/keyboard.sibilant:25:0 */

    var key = key_d_s$10[0],
        d = key_d_s$10[1],
        s = key_d_s$10[2];

    var playerVelocity = Velocity.get(player);
    var playerSprite = Sprite.get(player);
    return Keyboard.on([key, "down"], (() => {

        var vd = playerVelocity[d];
        playerVelocity[d] = (vd + (s * velocityUnit));
        return false;

    }));
});
var bindKey = (function bindKey$(key, f) {
    /* bind-key src/client/sidescroller/systems/keyboard.sibilant:37:0 */

    Keyboard.on([key, "down"], (() => {

        f();
        return false;

    }));
    return Keyboard.on([key, "up"], (() => {



    }));
});
var bindPlayerVelocityKeys = fmap(bindPlayerVelocityKey);
var position = (function position$(x, y) {
    /* position src/client/sidescroller/systems/misc.sibilant:5:0 */

    return {
        x,
        y
    };
});
var velocity = (function velocity$(xd, yd) {
    /* velocity src/client/sidescroller/systems/misc.sibilant:7:0 */

    return [xd, yd];
});
var dot = (function dot$(r, g, b, a) {
    /* dot src/client/sidescroller/systems/misc.sibilant:9:0 */

    return {
        r,
        g,
        b,
        a
    };
});
var physics = (function physics$(mass, scale, forces) {
    /* physics src/client/sidescroller/systems/misc.sibilant:12:0 */

    return {
        mass,
        scale,
        forces,
        falling: false
    };
});
var sprite = (function sprite$(image, frameCount, scale, dim, orientation) {
    /* sprite src/client/sidescroller/systems/misc.sibilant:16:0 */

    return {
        image,
        frameCount,
        scale,
        dim,
        orientation
    };
});
var collision = (function collision$(type) {
    /* collision src/client/sidescroller/systems/misc.sibilant:19:0 */

    return {
        type
    };
});
var entity = (function entity$(aspects, data) {
    /* entity src/client/sidescroller/systems/misc.sibilant:22:0 */

    return game.ent.spawn(aspects, data);
});
var floorTile = (function floorTile$(x, y) {
    /* floor-tile src/client/sidescroller/systems/misc.sibilant:25:0 */

    return [position((x * 32), (y * 32)), velocity(0, 0), dot(255, 255, 10, 255), physics(10, 32, []), collision("static")];
});
var TileMap = Interface.define("TileMap", {
    tree: create(TreeMap)(),
    get([x, y]) {

        return this.tree.get([x, y]);

    },
    spawn([x, y]) {

    }
});
console.log(physicalObject);
var Game = Interface.define("Game", {
    init(systems = [], gameSpeed = 1, entities = create(EntitySystem)(), events = (new EventEmitter()), ticker = create(Ticker)((gameSpeed * 60), events)) {

        this.systems = systems;
        this.gameSpeed = gameSpeed;
        this.entities = entities;
        this.events = events;
        this.ticker = ticker;
        systems.each(((s) => {

            return s.game = this;

        }));
        return this;

    },
    rendering: rendering,
    get ent() {

        return this.entities;

    },
    start(systems = this.systems, events = this.events, ticker = this.ticker, rendering = this.rendering) {

        this.stop();
        ticker.start();
        return events.on("tick", ((t) => {

            systems.each((function() {
                /* src/client/sidescroller/systems/game.sibilant:35:23 */

                return arguments[0].update();
            }));
            return rendering.update();

        })).once("error", ((err) => {

            console.log("error on", "tick", "of", "events", "given", "t()");
            return console.log(err);

        }));

    },
    stop(ticker = this.ticker, events = this.events) {

        ticker.stop();
        return events.removeAllListeners("tick");

    },
    clear(systems = this.systems, entities = this.entities, events = this.events, ticker = this.ticker) {

        ticker.stop();
        entities.clear();
        events.removeAllListeners();
        return systems.each((function() {
            /* src/client/sidescroller/systems/game.sibilant:46:19 */

            return arguments[0].clear();
        }));

    }
});
var physicsDot = [Position, Velocity, Dot, Physics, Collision],
    physicalObject = [Position, Velocity, Sprite, Physics, Collision],
    UP = -1,
    DOWN = 1,
    LEFT = -1,
    RIGHT = 1,
    velocityUnit = 16,
    walkLavo = Image.load("/home/aaron/Pictures/sprites/WalkLavo.png"),
    floorTileImage = Image.load("/home/aaron/Pictures/sprites/floortile.png");
console.log(physicalObject);
var game = create(Game)([Physics, Velocity, Collision, Position, Dot, rendering]);
var Lavo = [position(0, 0), velocity(0, 0), sprite(walkLavo, 4, 1, [32, 32], [1, 1]), physics(10, 32, [Gravity, Friction]), collision("dynamic")];
var PlayerDot = [position(0, 0), velocity(0, 0), dot(0, 10, 255, 255), physics(10, 32, [Gravity, Friction]), collision("dynamic")];
var player = entity(physicsDot, PlayerDot),
    floor = (function(array) {
        /* src/client/sidescroller/systems/components/sprite.sibilant:12:15 */

        (function() {
            /* src/client/sidescroller/meta/macros.sibilant:27:8 */

            var $for = null;
            for (var i = 0; i < 20; ++(i)) {
                $for = (function() {
                    /* src/client/sidescroller/meta/macros.sibilant:29:35 */

                    array.push((function() {
                        /* src/client/sidescroller/systems/components/sprite.sibilant:16:46 */

                        return (function(b, ...others) {
                            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

                            console.log("spawning floor", b, ...others);
                            return b;
                        })(entity(physicsDot, floorTile(i, 40)));
                    }).call(this));
                    return array;
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    }).call(this, []);
bindPlayerVelocityKeys([
    ["w", "yd", UP],
    ["s", "yd", DOWN],
    ["d", "xd", RIGHT],
    ["a", "xd", LEFT]
]);
var nothing = null;
game.events.removeAllListeners("collision").on("collision", (([c, c_, d]) => {

    var d1x = d[0],
        d1y = d[1],
        d2x = d[2],
        d2y = d[3],
        max = Math.max.apply(null, d),
        min = Math.min.apply(null, d);
    var physics = Physics.get(c.entity);
    return (function() {
        if (c.type === "dynamic") {
            (function() {
                if ((d1x === max || d2x === max)) {
                    c.pos.x = (c.pos.x + (function() {
                        if (d1x === max) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }).call(this) + (max * (function() {
                        if (d1x === max) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }).call(this)));
                    return c.velocity.xd[0] = undefined;
                }
            }).call(this);
            return (function() {
                if ((d1y === max || d2y === max)) {
                    c.pos.y = (c.pos.y + (function() {
                        if (d1y === max) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }).call(this) + (max * (function() {
                        if (d1y === max) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }).call(this)));
                    return c.velocity.yd[0] = undefined;
                }
            }).call(this);
        }
    }).call(this);

})).once("error", ((err) => {

    console.log("error on", "collision", "of", "game.events.removeAllListeners(\"collision\")", "given", "[ c, c_, d ]()");
    return console.log(err);

}));
game.events.on("collision", (function(b, ...others) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

    console.log("collision", b, ...others);
    return b;
}));
game.events.on("move", ((v) => {

    var collision = Collision.get(v.entity);
    return collision.colliding = false;

}));
game.events.on("move", (function(b, ...others) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

    console.log("moved", b, ...others);
    return b;
}));
game.start();
game.events.on("tick", (function(b, ...others) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

    console.log("tick", b, ...others);
    return b;
}));
var Player = interface.define("Player", {
    run() {

    },
    jump() {

    },
    fall() {

    },
    glide() {

    },
    fly() {

    }
});
console.log("DONE LOADING");