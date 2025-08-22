var {
    Interface
} = require("kit-interface");
var Mousetrap = require("mousetrap");
var Keyboard = Interface.define("Keyboard", {
    on([key, state], f) {

        return (function() {
            /* inc/misc.sibilant:8:27 */

            var keyState = ("key" + state);
            Mousetrap.unbind(key, keyState);
            return Mousetrap.bind(key, f, keyState);
        }).call(this);

    },
    once([key, stateName], f) {

        return (function() {
            /* inc/misc.sibilant:8:27 */

            var keyState = ("key" + stateName);
            return Mousetrap.bind(key, f, (() => {

                f();
                return Mousetrap.unbind(key, keyState);

            }), keyState);
        }).call(this);

    }
});
exports.Keyboard = Keyboard;