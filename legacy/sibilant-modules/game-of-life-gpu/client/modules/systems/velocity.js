var {
    Interface
} = require("kit-interface");
var {
    Component,
    System
} = require("../ecs/component"), {
    Position
} = require("./position");
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

        return this.system.process.systems.get(Position, this.entity);

    },
    accelerate([v1, v2]) {

        this.xd += v1;
        this.yd += v2;
        return this;

    }
});
exports.VelocityInterface = VelocityInterface;
var Velocity = System.define("Velocity", {
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
                p.x = (p.x + (xd * (this.game.ticker.elapsed / 1000)));
                return p.y = (p.y + (yd * (this.game.ticker.elapsed / 1000)));
            }
        }).call(this);

    }
});
exports.Velocity = Velocity;