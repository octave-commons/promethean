require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/aaron/devel/apps/game-of-life/client/modules/ecs/entity.js":[function(require,module,exports){
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
exports.Entity = Entity;
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
},{}]},{},[]);
