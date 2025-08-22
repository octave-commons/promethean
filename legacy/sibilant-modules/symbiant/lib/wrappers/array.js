"use strict";
class Mask {
    constructor(a) {
        this.a = a;
    }
    join() {
        return this.a.join.call(this.a,...arguments);
    }
    mapToObj(f) {
        var o = {};
        this.forEach(function(k,i) {
            o[k] = f(k,i);
        });
        return o;
    }
    forEach(f) {
        this.a.forEach(f);
    }
    map(f) {
        return this.a.map(f);
    }
    static create(a) {
        return new Mask(a);
    }
}
function createMaskedArray(a) {
    return Mask.create(a);
};
createMaskedArray.mask = Mask.create;
createMaskedArray.Mask = Mask;
module.exports = createMaskedArray;
