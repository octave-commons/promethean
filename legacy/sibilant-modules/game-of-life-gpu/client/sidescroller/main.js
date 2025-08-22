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
var {
    EventEmitter,
    emit,
    bubble
} = require("kit-events");
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
            return renderChildren(_parent, c(_parent), i, a);
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
var DocumentNode = EventEmitter.define("DocumentNode", {
    init(tagName = this.tagName, attributes = this.attributes, _children = [], _parent = this._parent, _node = document.createElement(tagName)) {

        this.tagName = tagName;
        this.attributes = attributes;
        this._children = _children;
        this._parent = _parent;
        this._node = _node;
        EventEmitter.init.call(this);
        return this;

    },
    get children() {

        return this._children;

    },
    get style() {

        return this._node.style;

    },
    clear(_node = this._node) {

        _node.innerHTML = "";
        return this;

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

        "create a Document-node from a native DOM Element";
        return create(DocumentNode)(_node.tagName, {}, [], _parent, _node);

    },
    append(node = this.node, children = this.children) {

        "add a child to the bottom of this one";
        children.push(node);
        return this;

    },
    prepend(node = this.node, children = this.children) {

        "add a child to the top of this one";
        return this.children = [node, children];

    },
    remove(_node = this._node, _parent = this._parent) {

        "remove this element from the tree.";
        _node.remove();
        _parent.children.filter(((c) => {

            return !(_node === c);

        }));
        _parent.emit("remove", _node);
        return this;

    }
});
var DocumentRoot = DocumentNode.define("DocumentRoot", {
    get _parent() {

        return this;

    },
    tagName: "html",
    _node: document.documentElement,
    _children: []
});
var DocumentBody = DocumentNode.define("DocumentBody", {
    get _parent() {

        return this;

    },
    tagName: "body",
    _node: document.body,
    _children: []
});
var DocumentHead = DocumentNode.define("DocumentHead", {
    get _parent() {

        return this;

    },
    tagName: "head",
    _node: document.head,
    _children: []
});
var createDocumentNode = create(DocumentNode);
console.log(document.appendChild);
var {
    Tree,
    TreeMap
} = require("tree-kit");
var exports = {};
window.global = window;
var events = require("events");
EventEmitter.removeAllListeners = (function EventEmitter$removeAllListeners$(...args) {
    /* Event-emitter.remove-all-listeners eval.sibilant:22:0 */

    return events.EventEmitter.prototype.removeAllListeners.call(this, ...args);
});
var curry = R.curry;
var fmap = R.curry(((f, a) => {

    return a.map(f);

}));
var fset = R.curry(((o, k, v) => {

    return o[k] = v;

}));
window.size = (function window$size$() {
    /* window.size eval.sibilant:33:0 */

    return [window.innerWidth, window.innerHeight];
});
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
    /* Array.transform eval.sibilant:54:0 */

    return (function(r) {
        /* eval.sibilant:1400:15 */

        a.each(((e, i) => {

            return r[i] = f(e, i);

        }));
        return r;
    }).call(this, r);
});
Array.prototype.bind = Array.bind = (function Array$bind$(a, f) {
    /* Array.bind eval.sibilant:58:8 */

    return a.reduce(((r, e, i) => {

        f(e, i).each(((x) => {

            return r.push(x);

        }));
        return r;

    }), []);
});
Array.prototype.each = (function Array$prototype$each$(f) {
    /* Array.prototype.each eval.sibilant:70:0 */

    this.forEach(f);
    return this;
});
Array.prototype.bind = (function Array$prototype$bind$(f) {
    /* Array.prototype.bind eval.sibilant:73:0 */

    return (function(r) {
        /* eval.sibilant:1400:15 */

        this.each(((a) => {

            return r.push(f(a));

        }));
        return r;
    }).call(this, []);
});
Map.prototype.each = (function Map$prototype$each$(f) {
    /* Map.prototype.each eval.sibilant:76:0 */

    this.forEach(f);
    return this;
});
var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
    /* euclidian-distance eval.sibilant:80:0 */

    return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var square = (function square$(dim, f) {
    /* square eval.sibilant:85:0 */

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
    /* inverse-square eval.sibilant:100:0 */

    return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});
var add = (function add$(a, b) {
    /* add eval.sibilant:119:0 */

    return (a + b);
});
var summate = (function summate$(a) {
    /* summate eval.sibilant:120:0 */

    return a.reduce(add, 0);
});
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
var {
    not: fnot,
    pipe: fpipe,
    equals
} = R;
Object.prototype.each = (function Object$prototype$each$(f) {
    /* Object.prototype.each eval.sibilant:132:0 */

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
    /* memoize eval.sibilant:143:0 */

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
    init(fps = this.fps, events = create(EventEmitter)()) {

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
var assert = require("assert");
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
            /* eval.sibilant:1400:15 */

            _keys.each(((k) => {

                return r.set(k, f(_members[k], k, r));

            }));
            return r;
        }).call(this, create(OrderedMap)());

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
                var r = (function() {
                    /* eval.sibilant:1396:20 */

                    _keys.push(key);
                    _keyPointers.set(_values.push(value));
                    return value;
                }).call(this);
                _members.set(key, r);
                return r;
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
                var r = (function() {
                    /* eval.sibilant:1396:20 */

                    _keys.unshift(key);
                    _keyPointers.set(_values.unshift(value));
                    return value;
                }).call(this);
                _members.set(key, r);
                return r;
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
    /* identity eval.sibilant:284:0 */

    return a;
});
var searchIfGiven = (function searchIfGiven$(array, value) {
    /* search-if-given eval.sibilant:286:0 */

    return conditional(array, (() => {

        return typeof value !== "undefined";

    }), search(value), identity);
});
var fprint = (function fprint$($value, ...args) {
    /* fprint eval.sibilant:293:0 */

    console.log($value, ...args);
    return $value;
});
var OrderedBucketMap = Interface.define("OrderedBucketMap", {
    init(_buckets = create(OrderedMap)()) {

        this._buckets = _buckets;
        return this;

    },
    set(k = this.k, v = this.v, _buckets = this._buckets) {

        return (function() {
            if (_buckets.has(k)) {
                return _buckets.get(k).push(v);
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
var productOf = (function productOf$(a) {
    /* product-of eval.sibilant:333:0 */

    return a.reduce(((value, e) => {

        return (value * e);

    }), 1);
});
var randomUbyte = (function randomUbyte$() {
    /* random-ubyte eval.sibilant:335:0 */

    return (Math.floor((Math.random() * (255 - 0))) + 0);
});
var setColor = (function setColor$(r, g, b, a, vert) {
    /* set-color eval.sibilant:342:0 */

    vert.color.r = r;
    vert.color.g = g;
    vert.color.b = b;
    return vert.color.a = a;
});
var setPoint = (function setPoint$(x, y, z, vert) {
    /* set-point eval.sibilant:349:0 */

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
            /* eval.sibilant:1400:15 */

            _members.delete(item);
            return item;
        }).call(this, _list.pop());

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
                    /* eval.sibilant:1400:15 */

                    _members.set(member, node);
                    _list.pushNode(node);
                    return node;
                }).call(this, _list.node(member));
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
            /* eval.sibilant:1400:15 */

            (function() {
                if (node) {
                    _list.removeNode(node);
                    return _members.delete(member);
                }
            }).call(this);
            return node;
        }).call(this, _members.get(member));

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
        /* eval.sibilant:1400:15 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < size; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    return array.push((function() {
                        /* eval.sibilant:464:46 */

                        return Object.create(_interface);
                    }).call(this));
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    }).call(this, []), _members = Group.from(_array), _available = Group.from(_array), _inUse = Group.create()) {

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
            /* eval.sibilant:1400:15 */

            _inUse.add(member);
            return member;
        }).call(this, _available.pop());

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
            /* eval.sibilant:1400:15 */

            r.init(...args);
            return r;
        }).call(this, this._pool.aquire());

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
var feach = R.curry(((f, a) => {

    return a.each(f);

}));
var bound = (function() {
        /* eval.sibilant:565:51 */

        return arguments[0].bind();
    }),
    clear = (function() {
        /* eval.sibilant:566:11 */

        return arguments[0].clear();
    }),
    rendered = (function() {
        /* eval.sibilant:567:14 */

        return arguments[0].render();
    }),
    unbound = (function() {
        /* eval.sibilant:569:13 */

        return arguments[0].unbind();
    }),
    disabled = (function() {
        /* eval.sibilant:570:14 */

        return arguments[0].disable();
    }),
    enabled = (function() {
        /* eval.sibilant:572:13 */

        return arguments[0].enable();
    });
var Gl = {};
Gl.shader = (function Gl$shader$(typeName, string, context) {
    /* Gl.shader eval.sibilant:576:0 */

    return (new Andy.Gl.Shader(Andy.Gl.Shader[typeName], string));
});
Gl.buffer = (function Gl$buffer$(_members, context) {
    /* Gl.buffer eval.sibilant:579:0 */

    return (new Andy.Gl.Buffer(context.ARRAY_BUFFER, context.DYNAMIC_DRAW)).bind().data(_members.data).unbind();
});
Gl.context = (function Gl$context$(dimensions, blend) {
    /* Gl.context eval.sibilant:585:0 */

    return (new Andy.Context()).makeCurrent().resize(...dimensions).clearColor(0, 0, 0, 0).blend(blend).clear();
});
Gl.uniform = (function Gl$uniform$(typeName, varName, value) {
    /* Gl.uniform eval.sibilant:593:0 */

    return (new Andy.Gl.Uniform[typeName](varName, value));
});
var uniforms = {
    res: Gl.uniform("Vector2", "Resolution", window.size()),
    scale: Gl.uniform("Float", "Scale", 1)
};
Gl.program = (function Gl$program$(vert, frag, context) {
    /* Gl.program eval.sibilant:605:0 */

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
    /* def-glsl eval.sibilant:680:0 */

    return (function(shader) {
        /* eval.sibilant:1400:15 */

        return shader;
    }).call(this, [outType, name, "(", inTypes.join(","), ")", "{\n", ...body, "}"].join(" "));
});
var vertShader = (function vertShader$() {
    /* vert-shader eval.sibilant:688:0 */

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
        this.interface.context = context;
        this.interface.rendering = this;
        context.gl.enable(context.gl.BLEND);
        context.gl.blendEquation(context.gl.FUNC_ADD);
        context.gl.blendFuncSeparate(context.gl.SRC_ALPHA, context.gl.ONE_MINUS_SRC_ALPHA, context.gl.ONE, context.gl.ONE_MINUS_SRC_ALPHA);
        PooledSystem.init.call(this, limit);
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
    /* handle-lag eval.sibilant:814:0 */

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
            /* eval.sibilant:832:16 */

            return (arguments[0] * value);
        }));

    },
    div(array = this.array, value = this.value) {

        return array.map((function() {
            /* eval.sibilant:834:16 */

            return (arguments[0] / value);
        }));

    },
    sub(array = this.array, value = this.value) {

        return array.map((function() {
            /* eval.sibilant:836:16 */

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
    'id': "stage"
}, []);
var container = createDocumentNode("div", {
    'id': "container"
}, [rendering.context.canvas]);
createDocumentNode("div", {
    'id': "frame"
}, [container]).render(DocumentRoot);
var spawnVertexLayer = (function spawnVertexLayer$() {
    /* spawn-vertex-layer eval.sibilant:864:0 */

    return rendering.spawn(1000000, Vertex, [uniforms.res, uniforms.scale], [vertShader(), fragmentShaderString]);
});
var assert = require("assert");
var freeSpace = (function freeSpace$(pool) {
    /* free-space eval.sibilant:875:0 */

    return pool.free;
});
var sumOf = (function sumOf$(list, f) {
    /* sum-of eval.sibilant:876:0 */

    return list.map();
});
List.reduce = (function List$reduce$(f, r) {
    /* List.reduce eval.sibilant:877:0 */

    this.each(((e, i, l) => {

        return r = f(r, e, i, l);

    }));
    return r;
});
List.findNode = (function List$findNode$(f = this.f, node = this.head) {
    /* List.find-node ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

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
    /* List.find ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

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
    /* List.rotate eval.sibilant:888:0 */

    return (function() {
        /* eval.sibilant:18:27 */

        return this.push(this.shift());
    }).call(this);
});
List.rotateUntil = (function List$rotateUntil$(predicate = this.predicate, t = 0) {
    /* List.rotate-until ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

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

        return (function(newPool) {
            /* eval.sibilant:1400:15 */

            buckets.unshift(newPool);
            return newPool;
        }).call(this, create(ObjectPool)(bucketSize, this.interface));

    },
    adjust(buckets = this.buckets) {

        var p = buckets.rotateUntil((function() {
            /* eval.sibilant:915:34 */

            return arguments[0].free > 0;
        }));
        return (p) ? p : this.grow();

    },
    aquire(buckets = this.buckets) {

        return (function(object) {
            /* eval.sibilant:1400:15 */

            object.bucket = this.current;
            return object;
        }).call(this, (function() {
            if (this.current.free) {
                return this.current.aquire();
            } else {
                return this.adjust().aquire();
            }
        }).call(this));

    },
    release(object = this.object, buckets = this.buckets) {

        return object.bucket.release(object);

    },
    clear(buckets = this.buckets) {

        var self = this;
        return buckets.each((function() {
            /* eval.sibilant:931:19 */

            return arguments[0]._inUse.each((function() {
                /* eval.sibilant:931:46 */

                return self.despawn(arguments[0]);
            }));
        }));

    },
    spawn(...args) {

        "aquire an object from the systems pool, and initialize it.";
        return (function(r) {
            /* eval.sibilant:1400:15 */

            r.init(...args);
            return r;
        }).call(this, this.aquire());

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

        return (function(c) {
            /* eval.sibilant:1400:15 */

            components.set(entity, c);
            return c;
        }).call(this, pool.spawn(entity, data, this));

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

        return accumulate(this.thread, this._updateAll(t).then(((nil) => {



        })));

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

        return (function(e) {
            /* eval.sibilant:1400:15 */

            group.add(e);
            return e;
        }).call(this, system.spawn(aspects, data));

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
    /* vertex-layer eval.sibilant:1112:0 */

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
        /* eval.sibilant:1167:28 */

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
            /* eval.sibilant:1244:20 */

            return arguments[0].apply(c);
        }));

    }
});
Physics.Force = Interface.define("Physics.Force", {
    build() {

        return (function() {
            if (!(this.name === "Physics.Force")) {
                return Physics.forces.push(this);
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
                v.xd += (-1 * (v.xd / 32));
                return v.yd += (-1 * (v.yd / 32));
            }
        }).call(this);

    }
});
var jimp = require("jimp");
var Pixel = Interface.define("Pixel", {
    init(x = this.x, y = this.y, image = this.image, tuple = (function(array) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < 4; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    array.push((function() {
                        /* eval.sibilant:1278:46 */

                        return image.bitmap.data[(image.getPixelIndex(x, y) + i)];
                    }).call(this));
                    return array;
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    })([])) {

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
            /* eval.sibilant:1303:18 */

            return jimp.read(arguments[0]);
        }), paths)).then(fmap(Image.create));

    },
    get([x, y] = [this.x, this.y], bitmap = this.bitmap) {

        var self = this;
        return (function() {
            if (self.pixelMap.has([x, y])) {
                return self.pixelMap.get([x, y]);
            } else {
                return (function(value) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    self.pixelMap.set([x, y], value);
                    return value;
                })((function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/macros.sibilant:30:25 */

                    return create(Pixel)(x, y, this.image);
                }).call(this));
            }
        }).call(this);

    },
    scan(f = this.f, image = this.image, bitmap = this.bitmap) {

        return (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var x = 0; x > image.width; ++(x)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    return (function() {
                        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

                        var $for = null;
                        for (var y = 0; y > image.width; ++(y)) {
                            $for = (function() {
                                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

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
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            (function() {
                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

                var $for = null;
                for (var i = 0; i < productOf(dim); ++(i)) {
                    $for = (function() {
                        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                        array.push((function() {
                            /* eval.sibilant:1278:46 */

                            return system.verts.spawn();
                        }).call(this));
                        return array;
                    }).call(this);
                };
                return $for;
            }).call(this);
            return array;
        })([]));

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
var Pixel = Interface.define("Pixel", {
    init(x = this.x, y = this.y, image = this.image, tuple = (function(array) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < 4; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    array.push((function() {
                        /* eval.sibilant:1403:46 */

                        return image.bitmap.data[(image.getPixelIndex(x, y) + i)];
                    }).call(this));
                    return array;
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    })([])) {

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
            /* eval.sibilant:1429:21 */

            return jimp.read(arguments[0]);
        }), paths)).then(fmap(Image.create));

    },
    get([x, y] = [this.x, this.y], bitmap = this.bitmap) {

        var self = this;
        return (function() {
            if (self.pixelMap.has([x, y])) {
                return self.pixelMap.get([x, y]);
            } else {
                return (function(value) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    self.pixelMap.set([x, y], value);
                    return value;
                })((function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/macros.sibilant:30:25 */

                    return create(Pixel)(x, y, this.image);
                }).call(this));
            }
        }).call(this);

    },
    scan(f = this.f, image = this.image, bitmap = this.bitmap) {

        return (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var x = 0; x > image.width; ++(x)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    return (function() {
                        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

                        var $for = null;
                        for (var y = 0; y > image.width; ++(y)) {
                            $for = (function() {
                                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

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
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            (function() {
                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

                var $for = null;
                for (var i = 0; i < productOf(dim); ++(i)) {
                    $for = (function() {
                        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                        array.push((function() {
                            /* eval.sibilant:1403:46 */

                            return system.verts.spawn();
                        }).call(this));
                        return array;
                    }).call(this);
                };
                return $for;
            }).call(this);
            return array;
        })([]));

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
    moveVertex(i = this.i, j = this.j, scale = this.scale, v = this.v, pos = this.pos, height = this.height, width = this.width) {

        v.point.x = (((pos.x - ((width * scale) / 2)) + (i * scale)) % rendering.dimensions[0]);
        v.point.y = (((pos.y - ((height * scale) / 2)) + (j * scale)) % rendering.dimensions[1]);
        return v.point.z = 0;

    },
    setColor(v, pixel) {

        v.color.r = pixel.r;
        v.color.g = pixel.g;
        v.color.b = pixel.b;
        return v.color.a = pixel.a;

    },
    draw(verts = this.verts, image = this.image, frameId = this.frameId, frameCount = this.frameCount, pos = this.pos, height = this.height, width = this.width) {

        ++(this.frameId);
        var scale = 1;
        return image.then(((bitMap) => {

            verts.each(((v, [i, j]) => {

                var pixel = this.getFramePixel(i, j, bitMap);
                this.moveVertex(i, j, scale, v);
                v.size = scale;
                return this.setColor(v, pixel);

            }));
            return this.system.game.emit("draw", [bitMap, this]);

        }));

    }
});
var Sprite = ComponentSystem.define("Sprite", {
    verts: rendering.spawn(1, Vertex, [uniforms.res, uniforms.scale], [vertShader(), fragmentShaderString]),
    interface: SpriteInterface,
    _updateComponent(sprite) {

    }
});
var Mousetrap = require("mousetrap");
var Keyboard = Interface.define("Keyboard", {
    on([key, state], f) {

        return (function() {
            /* eval.sibilant:18:27 */

            return Mousetrap.bind(key, f, ("key" + state));
        }).call(this);

    },
    once([key, stateName], f) {

        return (function() {
            /* eval.sibilant:18:27 */

            var keyState = ("key" + stateName);
            return Mousetrap.bind(key, f, (() => {

                f();
                return Mousetrap.unbind(key, keyState);

            }), keyState);
        }).call(this);

    }
});
var bindPlayerVelocityKey = (function bindPlayerVelocityKey$(key_d_s$43) {
    /* bind-player-velocity-key eval.sibilant:1521:0 */

    var key = key_d_s$43[0],
        d = key_d_s$43[1],
        s = key_d_s$43[2];

    var playerVelocity = Velocity.get(player);
    var vd = playerVelocity[d];
    Keyboard.on([key, "down"], (() => {

        playerVelocity[d] = (vd + (s * velocityUnit));
        return false;

    }));
    return Keyboard.on([key, "up"], (() => {

        playerVelocity[d] = 0;
        return false;

    }));
});
var position = (function position$(x, y) {
    /* position eval.sibilant:1534:0 */

    return {
        x,
        y
    };
});
var velocity = (function velocity$(xd, yd) {
    /* velocity eval.sibilant:1536:0 */

    return [xd, yd];
});
var dot = (function dot$(r, g, b, a) {
    /* dot eval.sibilant:1538:0 */

    return {
        r,
        g,
        b,
        a
    };
});
var physics = (function physics$(mass, scale, forces) {
    /* physics eval.sibilant:1541:0 */

    return {
        mass,
        scale,
        forces
    };
});
var sprite = (function sprite$(image, frameCount, scale, dim) {
    /* sprite eval.sibilant:1544:0 */

    return {
        image,
        frameCount,
        scale,
        dim
    };
});
var collision = (function collision$() {
    /* collision eval.sibilant:1547:0 */

    return null;
});
var entity = (function entity$(aspects, data) {
    /* entity eval.sibilant:1549:0 */

    return (function(b, ...others) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

        console.log("spawning entity", b, ...others);
        return b;
    })(game.ent.spawn(aspects, data));
});
var floorTile = (function floorTile$(x, y) {
    /* floor-tile eval.sibilant:1552:0 */

    return [position((x * 32), (y * 32)), velocity(0, 0), physics(10, 32, []), collision()];
});
var velocityUnit = 10;
var bindPlayerVelocityKeys = fmap(bindPlayerVelocityKey);
var movableDot = [Position, Dot, Velocity, Collision],
    physicsDot = [Position, Dot, Velocity, Collision, Physics],
    UP = -1,
    DOWN = 1,
    LEFT = -1,
    RIGHT = 1;
var physicsDot = [Position, Velocity, Dot, Physics, Collision],
    UP = -1,
    DOWN = 1,
    LEFT = -1,
    RIGHT = 1,
    velocityUnit = 16;
var Game = Interface.define("Game", {
    init(systems = [], gameSpeed = 1, entities = create(EntitySystem)(), events = create(EventEmitter)(), ticker = create(Ticker)((gameSpeed * 60), events)) {

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
                /* eval.sibilant:1599:23 */

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
            /* eval.sibilant:1610:19 */

            return arguments[0].clear();
        }));

    }
});
var game = create(Game)([Physics, Velocity, Collision, Position, Dot, rendering]);
var PlayerDot = [position(0, 0), velocity(0, 0), dot(0, 10, 255, 255), physics(10, 32, [Gravity, Friction]), collision("dynamic")];
var player = entity(physicsDot, PlayerDot),
    floor = (function(array) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < 20; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    array.push((function() {
                        /* eval.sibilant:1403:46 */

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
    })([]);
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

})).once("error", ((err) => {

    console.log("error on", "move", "of", "game.events", "given", "v()");
    return console.log(err);

}));
game.events.on("move", (function(b, ...others) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

    console.log("moved", b, ...others);
    return b;
}));
game.events.on("tick", (function(b, ...others) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

    console.log("tick", b, ...others);
    return b;
}));
Ticker.init(30).start().removeAllListeners("tick").on("tick", (() => {

    Position.update();
    Physics.update();
    Velocity.update();
    Collision.update();
    rendering.update();
    return Dot.update();

}));
game.start();
console.log("DONE LOADING");