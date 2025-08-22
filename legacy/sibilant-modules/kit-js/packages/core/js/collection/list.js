const {
    create,
    extend,
    mixin
} = require("../util");
const BaseList = require("../list.js");
const List = extend(BaseList, {
    symbol: Symbol("List"),
    reduce(callback = this.callback, r = create(this)(), l = this) {

        l.each((e) => {

            return r = callback(r, e, l);

        });
        return r;

    },
    bind(callback = this.callback, r = create(this)(), l = this) {

        return l.reduce((r, v) => {

            x = callback(v);
            console.log("x", x);
            console.log("r", r);
            x.each((x) => {

                return r.push(x);

            });
            return r;

        }, r);

    },
    ap(x, l = this) {

        return l.bind((f) => {

            return x.map(f);

        });

    },
    of(f, r = create(this)()) {

        r.push(f);
        return r;

    }
});
exports.List = List;
