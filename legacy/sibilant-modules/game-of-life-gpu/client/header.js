var feach = curry((function(f, a) {
    /* src/client/sidescroller/meta/macros.sibilant:106:26 */

    return a.each(f);
}));
var bound = (function() {
        /* eval.sibilant:14:11 */

        return arguments[0].bind();
    }),
    clear = (function() {
        /* eval.sibilant:15:11 */

        return arguments[0].clear();
    }),
    rendered = (function() {
        /* eval.sibilant:16:14 */

        return arguments[0].render();
    }),
    unbound = (function() {
        /* eval.sibilant:18:13 */

        return arguments[0].unbind();
    }),
    disabled = (function() {
        /* eval.sibilant:19:14 */

        return arguments[0].disable();
    }),
    enabled = (function() {
        /* eval.sibilant:21:13 */

        return arguments[0].enable();
    });