Array.transform = (function Array$transform$(f, a, r = a) {
    /* Array.transform eval.sibilant:8:0 */

    return (function(r) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        a.each(((e, i) => {

            return r[i] = f(e, i);

        }));
        return r;
    })(r);
});
Array.prototype.bind = Array.bind = (function Array$bind$(a, f) {
    /* Array.bind eval.sibilant:12:8 */

    return a.reduce(((r, e, i) => {

        f(e, i).each(((x) => {

            return r.push(x);

        }));
        return r;

    }), []);
});
Array.prototype.each = (function Array$prototype$each$(f) {
    /* Array.prototype.each eval.sibilant:19:0 */

    this.forEach(f);
    return this;
});
Array.prototype.bind = (function Array$prototype$bind$(f) {
    /* Array.prototype.bind eval.sibilant:23:0 */

    return (function(r) {
        /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

        this.each(((a) => {

            return r.push(f(a));

        }));
        return r;
    })([]);
});
Map.prototype.each = (function Map$prototype$each$(f) {
    /* Map.prototype.each eval.sibilant:26:0 */

    this.forEach(f);
    return this;
});