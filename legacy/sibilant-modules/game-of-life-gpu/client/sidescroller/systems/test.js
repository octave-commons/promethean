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
    /* List.rotate src/client/sidescroller/pools/dynamic.sibilant:15:0 */

    return (function() {
        /* src/client/sidescroller/systems/ecs.sibilant:4:8 */

        this.push(this.shift());
        return this;
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
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            buckets.unshift(newPool);
            return newPool;
        })(create(ObjectPool)(bucketSize, this.interface));

    },
    adjust(buckets = this.buckets) {

        var p = buckets.rotateUntil((function() {
            /* src/client/sidescroller/pools/dynamic.sibilant:42:34 */

            return arguments[0].free > 0;
        }));
        return (p) ? p : this.grow();

    },
    aquire(buckets = this.buckets) {

        return (function(object) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            object.bucket = this.current;
            return object;
        })((function() {
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
            /* src/client/sidescroller/pools/dynamic.sibilant:58:19 */

            return arguments[0]._inUse.each((function() {
                /* src/client/sidescroller/pools/dynamic.sibilant:58:46 */

                return self.despawn(arguments[0]);
            }));
        }));

    },
    spawn(...args) {

        "aquire an object from the systems pool, and initialize it.";
        return (function(r) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            console.log("spawning", r);
            console.log("with init", r.init);
            r.init(...args);
            return r;
        })(this.aquire());

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

        return (function(c) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            components.set(entity, c);
            return c;
        })(pool.spawn(entity, data, this));

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

        return (function(e) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            group.add(e);
            return e;
        })(system.spawn(aspects, data));

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
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < 4; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

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
                            /* src/client/sidescroller/systems/components/sprite.sibilant:16:46 */

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
var bindPlayerVelocityKey = (function bindPlayerVelocityKey$(key_d_s$9) {
    /* bind-player-velocity-key src/client/sidescroller/systems/keyboard.sibilant:25:0 */

    var key = key_d_s$9[0],
        d = key_d_s$9[1],
        s = key_d_s$9[2];

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
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        (function() {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:26:8 */

            var $for = null;
            for (var i = 0; i < 20; ++(i)) {
                $for = (function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/loops.sibilant:28:35 */

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