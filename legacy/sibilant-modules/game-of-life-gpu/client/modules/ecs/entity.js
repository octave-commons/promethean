var {
    Interface
} = require("kit-interface");
var {
    DynamicPool
} = require("../pooling/dynamic-pool");
var Entity = Interface.define("Entity", {
    doc: "used as a key to retrieve related components from different systems.",
    init(system = this.system, id = this.id, aspects = this.aspects, data = this.data, components = data.map(((d, i) => {

        return system.process.systems.get(aspects[i]).spawn(this, d);

    }))) {

        this.system = system;
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
    spawn(data, aspects, system) {

        return system.spawn(aspects, data);

    }
});
exports.Entity = Entity;
var EntitySystem = Interface.define("EntitySystem", {
    currentId: 0,
    init(process = this.process, pool = create(DynamicPool)(Entity, 256)) {

        this.process = process;
        this.pool = pool;
        return this;

    },
    get game() {

        return this.process;

    },
    clear() {

        return this.pool.clear();

    },
    spawn(aspects, data) {

        return this.pool.spawn(this, ((this.currentId) ++), aspects, data);

    }
});
exports.EntitySystem = EntitySystem;
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
exports.EntityGroup = EntityGroup;