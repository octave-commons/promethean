(function (a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);

var R = require('ramda');
var { create, extend, mixin, conditional, cond, partiallyApplyAfter } = require('kit/js/util');
var { Interface } = require('kit-interface');
var { Actor, sendTo } = require('kit-actor');
var { EventEmitter, emit, bubble } = require('kit-events');
var sibilant = require('sibilant');
var Compiler = Actor.define('Compiler', {
    init() {
        Actor.init.call(this);
        return this;
    },
    _send(data = this.data) {
        return Promise.resolve(data)
            .then(function () {
                /* src/compiler.sibilant:26:17 */

                return sibilant(arguments[0].toString()).js;
            })
            .then(R.tap(emit('message', this)))
            .catch(emit('error', this));
    },
    spawn() {
        return create(this)();
    },
});
exports.Compiler = Compiler;
