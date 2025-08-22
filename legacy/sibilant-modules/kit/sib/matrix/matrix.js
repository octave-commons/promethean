Matrix.each = (function Matrix$each$(f = this.f, width = this.width, height = this.height) {
    /* Matrix.each internal-dependencies/kit/inc/core/function-expressions.sibilant:24:8 */

    "standard itterative operator, accepts a function and applies it to every\n" +
    "element of the matrix";
    return (function(r) {
        /* apps/.app/sibilant/js/macros.sibilant:146:9 */

        (function() {
            /* apps/.app/sibilant/js/macros.sibilant:16:8 */

            var $for = null;
            for (var x = 0; x < width; ++(x)) {
                $for = (function() {
                    /* apps/.app/sibilant/js/macros.sibilant:18:35 */

                    return (function() {
                        /* apps/.app/sibilant/js/macros.sibilant:16:8 */

                        var $for = null;
                        for (var y = 0; y < height; ++(y)) {
                            $for = (function() {
                                /* apps/.app/sibilant/js/macros.sibilant:18:35 */

                                return f(r.get(x, y), x, y, r);
                            }).call(this);
                        };
                        return $for;
                    }).call(this);
                }).call(this);
            };
            return $for;
        }).call(this);
        return r;
    })(this);
});
Matrix.each = (function Matrix$each$(f = this.f, width = this.width, height = this.height) {
    /* Matrix.each internal-dependencies/kit/inc/core/function-expressions.sibilant:24:8 */

    "standard itterative operator, accepts a function and applies it to every\n" +
    "element of the matrix";
    return (function(r) {
        /* apps/.app/sibilant/js/macros.sibilant:146:9 */

        for (var x = 0; x < width; ++(x)) {

            for (var y = 0; y < height; ++(y)) {

                f(r.get(x, y), x, y, r)

            }


        };
        return r;
    })(this);
});
Matrix.each = (function Matrix$each$(f = this.f, width = this.width, height = this.height) {
    /* Matrix.each internal-dependencies/kit/inc/core/function-expressions.sibilant:24:8 */

    "standard itterative operator, accepts a function and applies it to every\n" +
    "element of the matrix";
    return let [r] = [this];
    for (var x = 0; x < width; ++(x)) {

        for (var y = 0; y < height; ++(y)) {

            f(r.get(x, y), x, y, r)

        }


    }
    return r;
});
