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
var Path = require("path");
module.filename = Path.join(process.cwd(), "./src/client/antity.sibilant");
global.create = create;
global.extend = extend;
global.mixin = mixin;
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
} = require("./modules/keyboard"), {
    Component,
    System
} = require("./modules/ecs/component");
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
var game = create(Game)(rendering, [Physics, Velocity, Collision, Position, Dot]);
var movableDot = [Position, Velocity, Dot, Physics, Collision],
    physicsDot = [Position, Dot, Velocity, Physics, Collision],
    UP = -1,
    DOWN = 1,
    LEFT = -1,
    RIGHT = 1;
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

})).once("error", ((err) => {

    console.log("error on", "collision", "of", "game.events.removeAllListeners(\"collision\")", "given", "[ c, c_, d ]()");
    return console.log(err);

}));
var position = (function position$(x, y) {
    /* position eval.sibilant:130:0 */

    return {
        x,
        y
    };
});
var velocity = (function velocity$(xd, yd) {
    /* velocity eval.sibilant:132:0 */

    return [xd, yd];
});
var dot = (function dot$(r, g, b, a) {
    /* dot eval.sibilant:134:0 */

    return {
        r,
        g,
        b,
        a
    };
});
var physics = (function physics$(mass, scale, forces) {
    /* physics eval.sibilant:137:0 */

    return {
        mass,
        scale,
        forces,
        falling: false
    };
});
var sprite = (function sprite$(image, frameCount, scale, dim) {
    /* sprite eval.sibilant:141:0 */

    return {
        image,
        frameCount,
        scale,
        dim
    };
});
var collision = (function collision$(type) {
    /* collision eval.sibilant:144:0 */

    return {
        type
    };
});
var entity = (function entity$(aspects, data) {
    /* entity eval.sibilant:147:0 */

    return game.ent.spawn(aspects, data);
});
var randomUbyte = (function randomUbyte$() {
    /* random-ubyte eval.sibilant:150:0 */

    return randomInt(0, 255);
});
var createAnt = (function createAnt$(x_y$1) {
    /* create-ant eval.sibilant:152:0 */

    var x = x_y$1[0],
        y = x_y$1[1];

    var ant = entity(physicsDot, [position(x, y), dot(255, 0, 0, 255), velocity(0, 0), physics(10, 10, []), collision("dynamic")]);
    ants.push(ant);
    return ant;
});
var {
    MatrixView,
    Matrix
} = require("./modules/data-structures/contrib");
var ants = [];
var ant = createAnt([200, 200]);
var tf = require("@tensorflow/tfjs");
defAsync(randomMove, ent(),
    var velocity = game.systems.get(Velocity, ent),
        pos = game.systems.get(Position, ent);,
    var w = await (weights.data());,
    var m = [];,
    for (var i = -1; i < 2; ++(i)) {
        for (var j = -1; j < 2; ++(j)) {
            var rel = [i, j];;
            var k = MatrixView.getIndex([Math.round((pos.x / 32)), Math.round((pos.y / 32))], rel, ((window.size()[1] / 32) + 3));;
            m.push([rel, w[k]])
        }

    },
    var k = Matrix.getIndex([Math.round((pos.x / 32)), Math.round((pos.y / 32))], window.size()[1]);, w[k] = (0.001 + w[k]);, velocity.accelerate(m.reduce((([xv, yv], [
        [i, j], _w
    ]) => {

        return [((xv + (i * _w)) || 0), ((yv + (j * _w)) || 0)];

    }), [0, 0])));
game.systems.get(Position, ants[0]).x = 200;
game.systems.get(Position, ants[0]).y = 200;
var createAnt = (function createAnt$(x_y$2) {
    /* create-ant eval.sibilant:198:0 */

    var x = x_y$2[0],
        y = x_y$2[1];

    var ant = entity(physicsDot, [position(x, y), dot(255, 0, 0, 255), velocity(0, 0), physics(10, 10, []), collision("dynamic")]);
    ants.push(ant);
    return ant;
});
weights.data().then(((d) => {

    return
        for (var i = 0; i > (window.size()[0] / 32); ++(i)) {
            for (var j = 0; j > (window.size()[1] / 32); ++(j)) {
                entity([Position, Dot, Physics], [position((i * 32), (j * 32)), dot(0, 255, 0)])
            }

        };

}));
var productOf = (function productOf$(a) {
    /* product-of eval.sibilant:270:0 */

    return a.reduce(((value, e) => {

        return (value * e);

    }), 1);
});
productOf(window.size());
defAsync(moveAnts, null, await (Promise.all(ants.map(randomMove))), weights.assign(tf.tidy((() => {

    return weights.sub(tf.scalar(0.00001));

}))));
var weights = tf.variable(tf.randomUniform(window.size().map((function() {
    /* eval.sibilant:278:65 */

    return (arguments[0] / 32);
}))));
game.events.on("tick", (() => {

    return moveAnts();

}));
game.start();