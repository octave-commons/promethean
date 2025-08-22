var {
    Interface
} = require("kit-interface");
var {
    EventEmitter
} = require("kit-events");
var Ticker = Interface.define("Ticker", {
    state: false,
    ticks: 0,
    get rate() {

        return (1000 / this.fps);

    },
    init(fps = this.fps, events = create(EventEmitter)()) {

        this.fps = fps;
        this.events = events;
        return this;

    },
    update(previous = this.previous, rate = this.rate) {

        (function() {
            if (this.state) {
                var now = Date.now();
                this.elapsed = (now - previous);
                window.requestAnimationFrame((() => {

                    return this.update();

                }));
                return (function() {
                    if (this.elapsed > rate) {
                        ++(this.ticks);
                        this.previous = now;
                        return this.events.emit("tick", now, this);
                    }
                }).call(this);
            }
        }).call(this);
        return this;

    },
    start() {

        this.state = true;
        this.previous = Date.now();
        return this.update();

    },
    stop() {

        this.state = false;
        return this;

    }
});
exports.Ticker = Ticker;