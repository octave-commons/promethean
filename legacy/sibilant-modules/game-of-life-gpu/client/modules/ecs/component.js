var {
    Interface
} = require("kit-interface");
var {
    OrderedMap
} = require("../data-structures/ordered-map"), {
    DynamicPool
} = require("../pooling/dynamic-pool");
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
exports.Component = Component;
var System = Interface.define("System", {
    interface: Component,
    register() {

    },
    init(process = this.process, interface = this.interface, components = create(OrderedMap)(), pool = create(DynamicPool)(interface), thread = Promise.resolve()) {

        this.process = process;
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
    template: true,
    get game() {

        return this.process;

    },
    build() {

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
exports.System = System;