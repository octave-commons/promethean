var {
    Interface
} = require("kit-interface");
var {
    Component,
    System
} = require("../ecs/component");
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
exports.PositionInterface = PositionInterface;
var Position = System.define("Position", {
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
                return c.x = (c.x + this.process.rendering.dimensions[0]);
            }
        }).call(this);
        (function() {
            if (c.y < 0) {
                return c.y = (c.y + this.process.rendering.dimensions[1]);
            }
        }).call(this);
        c.x = (c.x % this.process.rendering.dimensions[0]);
        return c.y = (c.y % this.process.rendering.dimensions[1]);

    }
});
exports.Position = Position;