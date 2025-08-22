var {
    Interface
} = require("kit-interface");
var {
    Component,
    System
} = require("../ecs/component"), {
    Velocity
} = require("../systems/velocity"), {
    Position
} = require("../systems/position");
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

        return this.system.process.systems.get(Velocity, this.entity);

    },
    get forces() {

        return this.data.forces;

    },
    get position() {

        return this.system.process.systems.get(Position, this.entity);

    },
    get location() {

        return this.position;

    }
});
exports.PhysicalProperties = PhysicalProperties;
var Physics = System.define("Physics", {
    interface: PhysicalProperties,
    _forces: [],
    registerForce(F = this.F, _forces = this._forces) {

        console.log("registering force", F);
        return create(F)(this);

    },
    register(forces = this.forces) {

        return this._forces = forces.map(((F) => {

            return this.registerForce(F, forces);

        }));

    },
    get forces() {

        return this._forces;

    },
    _updateComponent(c) {

        return c.forces.each((function() {
            /* eval.sibilant:41:20 */

            return arguments[0].apply(c);
        }));

    }
});
exports.Physics = Physics;
var {
    Collision
} = require("./collision");
Physics.Force = Interface.define("Physics.Force", {
    init(physics = this.physics) {

        this.physics = physics;
        return this;

    },
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
        var collision = c.system.process.systems.get(Collision, c.entity);
        return (function() {
            if (!(collision.colliding)) {
                return v.yd += 9.8;
            }
        }).call(this);

    }
});
exports.Gravity = Gravity;
var Friction = Physics.Force.define("Friction", {
    apply(c) {

        var v = c.velocity;
        var collision = c.system.process.systems.get(Collision, c.entity);
        return (function() {
            if (!(collision.colliding)) {
                v.xd += (-1 * (v.xd / 32));
                return v.yd += (-1 * (v.yd / 32));
            }
        }).call(this);

    }
});
exports.Friction = Friction;