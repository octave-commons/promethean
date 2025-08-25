(function (a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);

var Descriptions = {};
var R = require('ramda');
var fmap = R.curry((f, a) => {
    return a.map(f);
});
var is = {
    string(v) {
        return typeof v === 'string';
    },
};
is.empty__QUERY = function is$empty__QUERY$(value) {
    /* is.empty? node_modules/kit/inc/core/fp.sibilant:12:0 */

    return 0 === value.length;
};
var athrow = function athrow$(errType, message) {
    /* athrow node_modules/kit/inc/core/fp.sibilant:14:0 */

    return () => {
        return new errType(message);
    };
};
var getValueOf = function getValueOf$(o) {
    /* get-value-of node_modules/kit/inc/core/fp.sibilant:17:0 */

    return o.getValue();
};
var { create, extend, mixin, conditional, cond, partiallyApplyAfter } = require('kit/js/util');
var curry = R.curry;

(function (a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);

var Descriptions = {};
var R = require('ramda');
var fmap = R.curry((f, a) => {
    return a.map(f);
});
var is = {
    string(v) {
        return typeof v === 'string';
    },
};
is.empty__QUERY = function is$empty__QUERY$(value) {
    /* is.empty? node_modules/kit/inc/core/fp.sibilant:12:0 */

    return 0 === value.length;
};
var athrow = function athrow$(errType, message) {
    /* athrow node_modules/kit/inc/core/fp.sibilant:14:0 */

    return () => {
        return new errType(message);
    };
};
var getValueOf = function getValueOf$(o) {
    /* get-value-of node_modules/kit/inc/core/fp.sibilant:17:0 */

    return o.getValue();
};
var { create, extend, mixin, conditional, cond, partiallyApplyAfter } = require('kit/js/util');
var { Interface } = require('kit-interface');
var { Compiler } = require('./compiler'),
    { Reader } = require('./reader'),
    { Evaluator } = require('./evaluator'),
    { Layer } = require('./layer');
var REPL = Layer.of([Reader, Compiler, Evaluator]).define('REPL', {
    init() {
        Layer.init.call(this);
        this.on('message', ([type, value]) => {
            return this.emit(type, value);
        });
        return this;
    },
});
exports.REPL = REPL;
exports.Compiler = Compiler;
exports.Reader = Reader;
exports.Evaluator = Evaluator;
exports.Layer = Layer;
