var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("@kit-js/core/js/util");
var { 
  Interface
 } = require("@kit-js/interface");
var { 
  Dot
 } = require("sibilant-game-engine/client/systems/rendering/dot"),
    { 
  Position
 } = require("sibilant-game-engine/client/systems/position"),
    { 
  Velocity
 } = require("sibilant-game-engine/client/systems/velocity"),
    { 
  Physics
 } = require("sibilant-game-engine/client/systems/physics"),
    { 
  Component,
  System
 } = require("sibilant-game-engine/client/ecs/component"),
    { 
  Group
 } = require("sibilant-game-engine/client/data-structures/group"),
    { 
  Collision
 } = require("sibilant-game-engine/client/systems/collision"),
    { 
  SignalField
 } = require("./signal-field"),
    { 
  Friction
 } = require("./friction"),
    { 
  game,
  activeGameSystems
 } = require("./game"),
    { 
  TreeMap
 } = require("tree-kit"),
    config = require("./config");
var clear = (function() {
  /* eval.sibilant:1:854 */

  return arguments[0].clear();
});
var EntityGroup = Interface.define("EntityGroup", { 
  init( name = this.name,aspects = this.aspects,system = this.system,group = create(Group)() ){ 
    
      this.name = name;this.aspects = aspects;this.system = system;this.group = group;
      return this;
    
   },
  clear( group = this.group ){ 
    
      return group.each(((e) => {
      	
        return e.clear();
      
      }));
    
   },
  spawn( aspects = this.aspects,system = this.system,group = this.group ){ 
    
      return (function(e) {
        /* node_modules\kit\inc\scope.sibilant:12:9 */
      
        group.add(e);
        return e;
      })(system.spawn(aspects));
    
   }
 });
TreeMap.get = (function TreeMap$get$(...args) {
  /* Tree-map.get eval.sibilant:1:1520 */

  return this.find(...args).value;
});
var memoize = (function memoize$(f) {
  /* memoize eval.sibilant:1:1600 */

  var cache = create(TreeMap)();
  return ((...args) => {
  	
    return (function() {
      if (cache.has(args)) {
        return cache.get(args);
      } else {
        return (function(value) {
          /* node_modules\kit\inc\scope.sibilant:12:9 */
        
          cache.set(args, value);
          return value;
        })((function() {
          /* node_modules\kit\inc\macros.sibilant:30:25 */
        
          return f(...args);
        }).call(this));
      }
    }).call(this);
  
  });
});
var rgba = memoize(((r, g, b, a) => {
	
  return { 
    r,
    g,
    b,
    a
   };

}));
var entity = (function entity$(aspects) {
  /* entity eval.sibilant:1:1803 */

  return game.ent.spawn(aspects);
});
var home = entity([ Dot, Position, Physics, Collision ]);
var homePos = game.systems.get(Position, home);
game.systems.get(Dot, home).color = rgba(0, 255, 0, 255);
game.systems.get(Position, home).x = config.homeLocation[0];
game.systems.get(Position, home).y = config.homeLocation[1];
game.systems.get(Position, home).z = 1;
game.systems.get(Physics, home).scale = 1;
game.systems.get(Physics, home).mass = 1;
game.systems.get(Physics, home).forces = [];
var target = entity([ Dot, Position, Physics, Collision, Velocity ]);
game.systems.get(Dot, target).color = rgba(0, 0, 255, 255);
game.systems.get(Position, target).x = config.targetLocation[0];
game.systems.get(Position, target).y = config.targetLocation[1];
game.systems.get(Position, target).z = 1;
game.systems.get(Physics, target).scale = 30;
game.systems.get(Physics, target).mass = 10000;
game.systems.get(Physics, target).forces = [];
game.systems.get(Collision, target).name = "target";
game.systems.get(Collision, home).name = "home";
target.name = "target";
home.name = "home";
const ants=create(EntityGroup)("Ants", activeGameSystems, game.ent);
var spawnAnt = (function spawnAnt$(x_y$2, home, startingLife) {
  /* spawn-ant eval.sibilant:1:3123 */

  var x = x_y$2[0],
      y = x_y$2[1];

  var ant = ants.spawn(activeGameSystems);
  game.systems.get(Dot, ant).color = rgba(255, 0, 0, 255);
  game.systems.get(Position, ant).x = x;
  game.systems.get(Position, ant).y = y;
  game.systems.get(Position, ant).z = 1;
  game.systems.get(Physics, ant).scale = 1;
  game.systems.get(Physics, ant).mass = 1;
  game.systems.get(Physics, ant).forces = [ SignalField, Friction ];
  var v = game.systems.get(Velocity, ant);
  (function() {
    if (!(config.spawnStatic === 0)) {
      return v.accelerate([ (function() {
        /* eval.sibilant:1:1357 */
      
        var rand = ((Math.random() * (config.spawnStatic - 0)) + 0);
        return (config.spawnStatic - (rand * 2));
      }).call(this), (function() {
        /* eval.sibilant:1:1357 */
      
        var rand = ((Math.random() * (config.spawnStatic - 0)) + 0);
        return (config.spawnStatic - (rand * 2));
      }).call(this) ]);
    }
  }).call(this);
  return ant;
});
var number = 1;
var nextSpawn = (() => {
	
  return (function() {
    if (!(ants.group.size >= config.antLimit)) {
      spawnAnt([ homePos.x, homePos.y ], home);
      return setTimeout(nextSpawn, config.spawnRate);
    }
  }).call(this);

});
var clearAnts = (function clearAnts$() {
  /* clear-ants eval.sibilant:1:3992 */

  return ants.clear();
});
exports.ants = ants;
exports.target = target;
exports.home = home;
exports.homePos = homePos;
exports.nextSpawn = nextSpawn;
exports.clearAnts = clearAnts;