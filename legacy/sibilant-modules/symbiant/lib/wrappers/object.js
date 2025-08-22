"use strict";
var Promise = require("bluebird");
var inherits = require("util")
    .inherits;
////////////////////////////////////////////////////////////////////////////////
class Mask {
    constructor(o) {
        if (o instanceof Mask ) {
            return o;
        } else if(o.o) {
            return new Mask(o.o);
        }
        this.o = o;
    }
    set(name, v) {
        this.o[name] = v;
        return this;
    }
    get(name) {
        return this.o[name];
    }
    filter(f) {
        var r = {};
        let o = this.o;
        for (let i in o)
            if (f(o[i], i)) r[i] = o[i];
        return new Mask(r);
    }
    promiseAll() {
        console.log("promising all");
        return new Promise((s, f) => {
            var o = {};
            var keys = Object.keys(this.o);
            var pending = keys.length;
            var fail = false;
            this.map((p, i) =>
                     p.then(x => {
                         console.log("What?????????????????????????????????");
                         console.log(i,"finished on promise",x);
                         o[i] = x;
                         if (!--pending && !fail) {
                             console.log("DONE!",pending)
                             s(o)
                         }
                     })
                     .catch(e => {
                         console.log("fail!");
                         console.log("fail on promise",i)
                         fail = true;
                         f(e);
                     }));
        });
    }
    filter_reduce(ff, fr, v) {
        let o = this.o;
        for (let i in o)
            if (ff(o[i])) v = fr(v, o[i], i, o);
        return v;
    }
    map(f) {
        var r = {};
        let o = this.o;
        for (let i in o) r[i] = f(o[i], i, o);
        return new Mask(r);
    }
    mapOwn(f) {
        var o = this.o;
        var r = Object.create(o);
        Object.keys(o).forEach((k) => r[k] = f(o[k],k,o));
        return new Mask(r);
    }
    map_reduce(fm, fr, v) {
        let o = this.o;
        for (let i in o) v = fr(v, fm(o[i], i, o), i, o);
        return v;
    }
    forEach(f) {
        let o = this.o;
        for (let i in o) f(o[i], i, o);
    }
    copy() {
        return this.map((x) => x);
    }
    forEachOwn(f) {
        let o = this.o;
        let keys = Object.keys(this.o);
        keys.forEach((k) => f(o[k], k, o));
    }
    reduce(f, v) {
        let o = this.o;
        for (let i in o) v = f(v, o[i], i, o);
        return v;
    }
    join(del, pref, posf) {
        // merge key value pairs into string
    }
    merge(p) {
        var o = this.o
        for (let k in p) {
            o[k] = p[k];
        }
        return mask(o);
    }
    mergeOwn(p) {
        var o = this.o
        Object.keys(p)
            .forEach((k) => o[k] = p[k]);
        return mask(o);
    }
    concat(a) {
        var ret = {};
        mask(a).forEach((ae,k) => ret[k] = ae);
        this.forEach((xe,j) => ret[j] = xe);
        return ret;
    }
    extend(p) {
        return mask(Object.create(this.o)).mergeOwn(p);
    }
    product(x) {
        let o = this.o;
        return mask(x)
            .map((f, name) => f(o[name]));
    }
    static create(o) {
        return new Mask(o);
    }
}


var mask = exports.mask = Mask.create;
exports.Mask = Mask;
