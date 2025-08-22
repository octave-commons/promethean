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
var assert = require("assert");
global.create = create;
global.extend = extend;
global.mixin = mixin;
var Path = require("path");
module.filename = Path.join(process.cwd(), "./src/client/antity.sibilant");
var {
    Rendering
} = require("./modules/systems/rendering/rendering"), {
    Scalar
} = require("./modules/math/scalar"), {
    fmap
} = require("./modules/utils"), {
    Position
} = require("./modules/systems/position"), {
    Velocity
} = require("./modules/systems/velocity"), {
    Dot
} = require("./modules/systems/rendering/dot"), {
    Physics,
    Gravity,
    Friction
} = require("./modules/systems/physics"), {
    Collision
} = require("./modules/systems/collision"), {
    Game
} = require("./modules/game"), {
    Keyboard
} = require("./modules/keyboard");
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
var despawned = (($fpipe) => {

    return $fpipe.despawn();

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
var freeSpace = (function freeSpace$(pool) {
    /* free-space eval.sibilant:93:0 */

    return pool.free;
});
var sumOf = (function sumOf$(list, f) {
    /* sum-of eval.sibilant:94:0 */

    return list.map();
});
var position = (function position$(x, y) {
    /* position eval.sibilant:98:0 */

    return {
        x,
        y
    };
});
var velocity = (function velocity$(xd, yd) {
    /* velocity eval.sibilant:100:0 */

    return [xd, yd];
});
var dot = (function dot$(r, g, b, a) {
    /* dot eval.sibilant:102:0 */

    return {
        r,
        g,
        b,
        a
    };
});
var physics = (function physics$(mass, scale, forces) {
    /* physics eval.sibilant:105:0 */

    return {
        mass,
        scale,
        forces,
        falling: false
    };
});
var sprite = (function sprite$(image, frameCount, scale, dim) {
    /* sprite eval.sibilant:109:0 */

    return {
        image,
        frameCount,
        scale,
        dim
    };
});
var collision = (function collision$(type) {
    /* collision eval.sibilant:112:0 */

    return {
        type
    };
});
var entity = (function entity$(aspects, data) {
    /* entity eval.sibilant:115:0 */

    return game.ent.spawn(aspects, data);
});
var floorTile = (function floorTile$(x, y) {
    /* floor-tile eval.sibilant:118:0 */

    return [position((x * 32), (y * 32)), dot(255, 255, 10, 255), velocity(0, 0), physics(10, 32, []), collision("static")];
});
var velocityUnit = 16;
var bindPlayerVelocityKey = (function bindPlayerVelocityKey$(key_d_s$10) {
    /* bind-player-velocity-key eval.sibilant:126:0 */

    var key = key_d_s$10[0],
        d = key_d_s$10[1],
        s = key_d_s$10[2];

    var velocity = game.systems.get(Velocity, player),
        collision = game.systems.get(Collision, player);
    var vd = velocity[d];
    return Keyboard.on([key, "down"], (() => {

        console.log("pressed", key);
        velocity[d] = (vd + (s * velocityUnit));
        return false;

    }));
});
var bindPlayerVelocityKeys = fmap(bindPlayerVelocityKey);
var movableDot = [Position, Velocity, Dot, Physics, Collision],
    physicsDot = [Position, Dot, Velocity, Physics, Collision],
    UP = -50,
    DOWN = 50,
    LEFT = -50,
    RIGHT = 50;
var game = create(Game)(rendering, [Physics, Velocity, Collision, Position, Dot]);
var PlayerDot = [position(0, 0), dot(0, 10, 255, 255), velocity(0, 0), physics(10, 32, [Gravity, Friction]), collision("dynamic")];
var player = entity(physicsDot, PlayerDot),
    floor = (function(array) {
        /* inc/misc.sibilant:28:15 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < 20; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

                    array.push((function() {
                        /* inc/misc.sibilant:32:46 */

                        return (function(b, ...others) {
                            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/console.sibilant:10:8 */

                            console.log("spawning floor", b, ...others);
                            return b;
                        })(entity(physicsDot, floorTile(i, 20)));
                    }).call(this));
                    return array;
                }).call(this);
            };
            return $for;
        }).call(this);
        return array;
    }).call(this, []);
var nothing = null;
game.events.removeAllListeners("collision").on("collision", (([c, c_, d]) => {

    var d1x = d[0],
        d1y = d[1],
        d2x = d[2],
        d2y = d[3],
        max = Math.max.apply(null, d),
        min = Math.min.apply(null, d);
    var physics = game.systems.get(Physics, c.entity);
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

}));
game.events.on("move", ((v) => {

    var collision = game.systems.get(Collision, v.entity);
    return collision.colliding = false;

})).once("error", ((err) => {

    console.log("error on", "move", "of", "game.events", "given", "v()");
    return console.log(err);

}));
bindPlayerVelocityKeys([
    ["w", "yd", UP],
    ["s", "yd", DOWN],
    ["d", "xd", RIGHT],
    ["a", "xd", LEFT]
]);
game.start();
console.log("DONE LOADING");