require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/aaron/devel/apps/game-of-life/client/modules/data-structures/list.js":[function(require,module,exports){
List.reduce = (function List$reduce$(f, r) {
    /* List.reduce eval.sibilant:2:0 */

    this.each(((e, i, l) => {

        return r = f(r, e, i, l);

    }));
    return r;
});
List.findNode = (function List$findNode$(f = this.f, node = this.head) {
    /* List.find-node ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

    return (function() {
        if (f(node)) {
            return node;
        } else if (!(node === this.tail)) {
            return List.find(f, node.next);
        } else {
            return false;
        }
    }).call(this);
});
List.find = (function List$find$(f = this.f, node = this.head) {
    /* List.find ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

    var r = List.findNode(f, node);
    return (function() {
        if (r) {
            return r.value;
        } else {
            return false;
        }
    }).call(this);
});
List.rotate = (function List$rotate$() {
    /* List.rotate eval.sibilant:14:0 */

    return (function() {
        /* eval.sibilant:21:27 */

        return this.push(this.shift());
    }).call(this);
});
List.rotateUntil = (function List$rotateUntil$(predicate = this.predicate, t = 0) {
    /* List.rotate-until ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

    return (function() {
        if (predicate(this.head.item)) {
            return this.head.item;
        } else if (!(t > this.size)) {
            return this.rotate().rotateUntil(predicate, ++(t));
        } else {
            return false;
        }
    }).call(this);
});
exports.List = List;
},{}]},{},[]);
