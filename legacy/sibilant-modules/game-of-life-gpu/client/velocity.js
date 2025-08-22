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