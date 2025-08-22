var Keyboard = Interface.define("Keyboard", {
    on([key, state], f) {

        return (function() {
            /* eval.sibilant:18:27 */

            return Mousetrap.bind(key, f, ("key" + state));
        }).call(this);

    },
    once([key, stateName], f) {

        return (function() {
            /* eval.sibilant:18:27 */

            var keyState = ("key" + stateName);
            return Mousetrap.bind(key, f, (() => {

                f();
                return Mousetrap.unbind(key, keyState);

            }), keyState);
        }).call(this);

    }
});