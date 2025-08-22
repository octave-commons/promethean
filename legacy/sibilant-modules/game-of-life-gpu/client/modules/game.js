var {
    Interface
} = require("kit-interface");
var {
    EntitySystem
} = require("./ecs/entity"), {
    EventEmitter
} = require("kit-events"), {
    Ticker
} = require("./ticker"), {
    OrderedMap
} = require("./data-structures/ordered-map");
var Game = Interface.define("Game", {
    init(rendering = this.rendering, systemTypes = [], gameSpeed = 1, entities = create(EntitySystem)(this), events = create(EventEmitter)(), ticker = create(Ticker)((gameSpeed * 60), events), systems = create(OrderedMap)()) {

        this.rendering = rendering;
        this.systemTypes = systemTypes;
        this.gameSpeed = gameSpeed;
        this.entities = entities;
        this.events = events;
        this.ticker = ticker;
        this.systems = systems;
        var getSystemBySymbol = systems.get;
        systems.get = (function systems$get$(interface, ent) {
            /* systems.get eval.sibilant:22:8 */

            var sys = getSystemBySymbol.call(systems, interface.symbol);
            return (function() {
                if (ent) {
                    return sys.get(ent);
                } else {
                    return sys;
                }
            }).call(this);
        });
        systemTypes.each(((s) => {

            console.log("creating system", s);
            return systems.push([s.symbol, create(s)(this)]);

        }));
        console.log("done creating systems", this.systems);
        this.systems.push([rendering.symbol, rendering]);
        return this;

    },
    get ent() {

        return this.entities;

    },
    start(systems = this.systems, events = this.events, ticker = this.ticker, rendering = this.rendering) {

        this.stop();
        ticker.start();
        return events.on("tick", ((t) => {

            return systems.each((function() {
                /* eval.sibilant:41:40 */

                return arguments[0].update();
            }));

        })).once("error", ((err) => {

            console.log("error on", "tick", "of", "events", "given", "t()");
            return console.log(err);

        }));

    },
    stop(ticker = this.ticker, events = this.events) {

        ticker.stop();
        return events.removeAllListeners("tick");

    },
    clear(systems = this.systems, entities = this.entities, events = this.events, ticker = this.ticker) {

        ticker.stop();
        entities.clear();
        events.removeAllListeners();
        return systems.each((function() {
            /* eval.sibilant:51:19 */

            return arguments[0].clear();
        }));

    }
});
exports.Game = Game;