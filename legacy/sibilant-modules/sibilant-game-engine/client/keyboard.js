var {
    Interface
} = require("kit-interface");
var Mousetrap = require("mousetrap");
var Keyboard = Interface.define("Keyboard", {
    on([key, state], f) {

        return fluently(var keyState = ("key" + state);, Mousetrap.unbind(key, keyState), Mousetrap.bind(key, f, keyState));

    },
    once([key, stateName], f) {

        return fluently(var keyState = ("key" + stateName);, Mousetrap.bind(key, f, (() => {

            f();
            return Mousetrap.unbind(key, keyState);

        }), keyState));

    }
});
exports.Keyboard = Keyboard;