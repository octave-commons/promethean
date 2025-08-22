var { 
  Position
 } = require("sibilant-game-engine/client/systems/position"),
    { 
  Physics
 } = require("sibilant-game-engine/client/systems/physics"),
    { 
  createVectorField,
  updateParticle
 } = require("./field"),
    { 
  Collision
 } = require("sibilant-game-engine/client/systems/collision");
var config = require("./config"),
    { 
  game
 } = require("./game"),
    entities = require("./entities");
var SignalField = Physics.Force.define("SignalField", { 
  field:createVectorField(config.columns, config.rows),
  layer:createVectorField(config.columns, config.rows),
  apply( c = this.c,field = this.field,layer = this.layer ){ 
    
      var v = c.velocity;
      var collision = c.system.process.systems.get(Collision, c.entity);
      return (function() {
        if (!(collision.colliding)) {
          updateParticle(v, v.pos, field, layer, game.ticker.ticks, false, false, entities.homePos);
          var winRate = (v.winCount / ((1 + v.looseCount) || 1));
          return c.scale = (1 * (function() {
            if (winRate > 1) {
              return winRate;
            } else {
              return 1;
            }
          }).call(this));
        }
      }).call(this);
    
   }
 });
exports.SignalField = SignalField;