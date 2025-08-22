var Game = Interface.define("Game", {
    init(systems = [], gameSpeed = 1, entities = create(EntitySystem)(), events = create(EventEmitter)(), ticker = create(Ticker)((gameSpeed * 60), events)) {

        this.systems = systems;
        this.gameSpeed = gameSpeed;
        this.entities = entities;
        this.events = events;
        this.ticker = ticker;
        systems.each(((s) => {

            return s.game = this;

        }));
        return this;

    },
    rendering: rendering,
    get ent() {

        return this.entities;

    },
    start(systems = this.systems, events = this.events, ticker = this.ticker, rendering = this.rendering) {

        this.stop();
        ticker.start();
        return events.on("tick", ((t) => {

            systems.each((function() {
                /* eval.sibilant:20:23 */

                return arguments[0].update();
            }));
            return rendering.update();

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
            /* eval.sibilant:31:19 */

            return arguments[0].clear();
        }));

    }
});