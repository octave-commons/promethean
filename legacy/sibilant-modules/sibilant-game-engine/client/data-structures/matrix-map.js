var {
    Interface
} = require("kit-interface");
var {
    Matrix
} = require("./contrib");
var MatrixMap = Interface.define("MatrixMap", {
    init(dim = this.dim, array = []) {

        this.dim = dim;
        this.array = array;
        return this;

    },
    extend: Matrix,
    get([x, y]) {

        return Matrix.get.call(this, x, y);

    },
    set([x, y], v) {

        return Matrix.get.call(this, x, y, v);

    },
    has([x, y]) {

        return (function() {
            if (this.get([x, y])) {
                return true;
            } else {
                return false;
            }
        }).call(this);

    },
    get width() {

        return this.dim[0];

    },
    get height() {

        return this.dim[1];

    },
    each(f = this.f, width = this.width, height = this.height) {

        "standard itterative operator, accepts a function and applies it to every\n" + "element of the matrix";
        var r = this;
        for (var i = 0; i < width; ++(i)) {
            for (var j = 0; j < height; ++(j)) {
                f(r.get([i, j]), [i, j], r)
            }

        };
        return r;

    }
});
exports.MatrixMap = MatrixMap;