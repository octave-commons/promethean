var {
    Interface
} = require("kit-interface");
var {
    ObjectPool
} = require("./object-pool"), {
    List
} = require("../data-structures/list");
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
            /* eval.sibilant:19:34 */

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
            /* eval.sibilant:35:19 */

            return arguments[0]._inUse.each((function() {
                /* eval.sibilant:35:46 */

                return self.despawn(arguments[0]);
            }));
        }));

    },
    spawn(...args) {

        "aquire an object from the systems pool, and initialize it.";
        return (function(r) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

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
exports.DynamicPool = DynamicPool;