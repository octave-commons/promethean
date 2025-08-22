var {
    Interface
} = require("kit-interface");
var {
    DynamicPool
} = require("./dynamic-pool");
var PooledSystem = Interface.define("PooledSystem", {
    init(interface = this.interface, _pool = create(DynamicPool)(interface)) {

        this.interface = interface;
        this._pool = _pool;
        this.register(interface);
        return this;

    },
    systems: (new Map()),
    clear(_pooled = this._pooled) {

        _pooled.each(feach(despawned));
        return _pooled.clear();

    },
    spawn(...args) {

        "aquire an object from the systems pool, and initialize it.";
        return (function(r) {
            /* inc/misc.sibilant:29:15 */

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
exports.PooledSystem = PooledSystem;