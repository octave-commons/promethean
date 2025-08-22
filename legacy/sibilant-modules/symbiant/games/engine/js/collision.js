var { 
  game
 } = require("./game"),
    { 
  Physics
 } = require("sibilant-game-engine/client/systems/physics"),
    { 
  Velocity
 } = require("sibilant-game-engine/client/systems/velocity"),
    { 
  Collision
 } = require("sibilant-game-engine/client/systems/collision"),
    { 
  home,
  homePos,
  target
 } = require("./entities"),
    { 
  updateParticle
 } = require("./field"),
    { 
  SignalField
 } = require("./signal-field"),
    Tone = require("tone"),
    config = require("./config");
const synth=(new Tone.Synth()).toDestination();
var isCollision = false;
var isWin = false;
var isLoose = false;
const collisionSynth=(new Tone.FMSynth()).toDestination();
const looseSynth=(new Tone.FMSynth()).toDestination();
const winSynth=(new Tone.FMSynth()).toDestination();
const winLoop=(new Tone.Loop(((time) => {
	
  return (function() {
    if (isWin) {
      winSynth.triggerAttackRelease("C4", "32n", time);
      return isWin = false;
    }
  }).call(this);

}), "64n")).start(0);
const looseLoop=(new Tone.Loop(((time) => {
	
  return (function() {
    if (isLoose) {
      looseSynth.triggerAttackRelease("B3", "32n", time);
      return isLoose = false;
    }
  }).call(this);

}), "64n")).start("64n");
const collisionLoop=(new Tone.Loop(((time) => {
	
  return (function() {
    if (isCollision) {
      collisionSynth.triggerAttackRelease("A2", "32n", time);
      return isCollision = false;
    }
  }).call(this);

}), "64n")).start("16n");
Tone.Transport.start();
Tone.Transport.bpm.rampTo(800, 100);
game.events.on("loose", (() => {
	
  return isLoose = true;

})).once("error", ((err) => {
	
  console.log("error on", "loose", "of", "game.events", "given", "null");
  return console.log(err);

}));
game.events.on("collision", (([ c, c_, d ]) => {
	
  var cv = game.systems.get(Velocity, c.entity);
  var c_v = game.systems.get(Velocity, c_.entity);
  var cp = game.systems.get(Physics, c.entity);
  var c_p = game.systems.get(Physics, c_.entity);
  (function() {
    if (config.printCollisionEvent) {
      return console.log("collision event", c, c_, d, Collision.quads, { 
        home,
        homePos,
        target
       });
    }
  }).call(this);
  (function() {
    if (c.entity === c_.entity) {
      return (function() {
        if (config.printCollisionEvent) {
          return console.log("something thinks its colliding with its self");
        }
      }).call(this);
    } else if ((c.entity === home || c_.entity === home)) {
      return (function() {
        if (config.printCollisionEvent) {
          return console.log("something collided with home", c.entity, c_.entity);
        }
      }).call(this);
    } else if (((c.entity === home && c_.entity === target) || (c_.entity === home && c.entity === target))) {
      return (function() {
        if (config.printCollisionEvent) {
          return console.log("target colliding with spawn");
        }
      }).call(this);
    } else if (c.entity === target) {
      isWin = true;
      updateParticle(c_v, c_v.pos, SignalField.field, SignalField.layer, game.ticker.ticks, true, true, homePos);
      c_v.pos.x = homePos.x;
      c_v.pos.y = homePos.y;
      return (function() {
        if (!(config.collisionStatic === 0)) {
          return c_v.accelerate([ (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this), (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this) ]);
        }
      }).call(this);
    } else if (c_.entity === target) {
      isWin = true;
      (function() {
        if (config.printCollisionEvent) {
          return console.log("ant found target");
        }
      }).call(this);
      updateParticle(cv, cv.pos, SignalField.field, SignalField.layer, game.ticker.ticks, true, true, homePos);
      cv.pos.x = homePos.x;
      cv.pos.y = homePos.y;
      return (function() {
        if (!(config.collisionStatic === 0)) {
          return cv.accelerate([ (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this), (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this) ]);
        }
      }).call(this);
    } else if (!(((c.entity === home && c_.entity === home) || (c.entity === target && c_.entity === target)))) {
      (function() {
        if (config.printCollisionEvent) {
          return console.log("ant is colliding with another ant", c, c_);
        }
      }).call(this);
      isCollision = true;
      (function() {
        if (!(config.collisionStatic === 0)) {
          cv.accelerate([ (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this), (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this) ]);
          return c_v.accelerate([ (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this), (function() {
            /* eval.sibilant:1:785 */
          
            var rand = ((Math.random() * (config.collisionStatic - 1)) + 1);
            return (config.collisionStatic - (rand * 2));
          }).call(this) ]);
        }
      }).call(this);
      updateParticle(c_v, c_v.pos, SignalField.field, SignalField.layer, game.ticker.ticks, config.decayOnCollision, false, homePos);
      return updateParticle(cv, cv.pos, SignalField.field, SignalField.layer, game.ticker.ticks, config.decayOnCollision, false, homePos);
    }
  }).call(this);
  c_.colliding = false;
  return c.colliding = false;

})).once("error", ((err) => {
	
  console.log("error on", "collision", "of", "game.events", "given", "[ c, c_, d ]()");
  return console.log(err);

}));