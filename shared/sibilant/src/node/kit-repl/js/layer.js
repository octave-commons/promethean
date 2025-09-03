// SPDX-License-Identifier: GPL-3.0-only
(function (a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);

var R = require('ramda');
var { create, extend, mixin, conditional, cond, partiallyApplyAfter } = require('kit/js/util');
var { Interface } = require('kit-interface');
var { Actor, sendTo } = require('kit-actor');
var { EventEmitter, emit, bubble } = require('kit-events');
var curry = R.curry;
var assignHandlers = function assignHandlers$(layer) {
    /* assign-handlers src/layer.sibilant:25:0 */
};
var Layer = Actor.define('Layer', {
    init(
        types = this.types,
        members = types.map((t) => {
            return create(t)();
        }),
    ) {
        this.types = types;
        this.members = members;
        types.each((t, i) => {
            return (this[t.symbol] = members[i]);
        });
        Actor.init.call(this);
        return this;
    },
    get assignHandlers() {
        return (a, i) => {
            var members = this.members;
            return bubble(a.on('message', R.pipe(sendTo(this.members[i + 1]))), this, 'error');
        };
    },
    _send(d = this.d, members = this.members) {
        return members[0].send(d);
    },
    start(members = this.members) {
        return function () {
            /* meta.sibilant:3:27 */

            var last = members.slice(-1)[0],
                inner = members.slice(0, -1);
            inner.forEach(this.assignHandlers);
            bubble(last, this, 'message');
            return this;
        }.call(this);
    },
    of(types) {
        return extend(this, {
            types,
        });
    },
});
exports.Layer = Layer;
