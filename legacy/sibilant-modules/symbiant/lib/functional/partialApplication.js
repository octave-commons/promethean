"use strict";
////////////////////////////////////////////////////////////////////////////////
function curry(f, n, a) {
    a = a || [];
    if (a.length >= (n || f.length)) {
        return f(...a);
    }

    function curry_continue() {
        return curry(f, n, [...a, ...arguments]);
    }
    curry_continue.f = f;
    curry_continue.n = n;
    curry_continue.a = a;
    return curry_continue;
}
////////////////////////////////////////////////////////////////////////////////
function defer(f, a, n) {
    a = a || [];
    n = n || f.length;
    let l = a.length;
    return function() {
        if (l >= n) {
            return f(...a);
        }
        return defer(f, [...a, ...arguments], n);
    };
}
////////////////////////////////////////////////////////////////////////////////
function bind(object, method) {
    return function bind_call() {
        return method.call(object, ...arguments);
    };
}
//bind(obj,obj.func)(...p) === obj.func(...p)
////////////////////////////////////////////////////////////////////////////////
function partial(f) {
    return function partial_args() {
        let a = arguments;
        return function partial_call() {
            return f(...a, ...arguments);
        };
    };
}
// partial(func)(...pa)(...pb) === func(...pa,...pb)
////////////////////////////////////////////////////////////////////////////////
function post_partial(f) {
    return function post_partial_args(f) {
        let a = arguments;
        return function post_partial_call() {
            return f(...arguments, ...a);
        };
    };
}
module.exports = {
    post:post_partial,
    pre:partial,
    defer:defer,
    curry:curry,
    bind:bind
}
