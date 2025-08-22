let socket = io("/ants");
socket.on("change", () => {
	
  console.log("change ");
  return location.reload();

});
const { 
  create,
  extend,
  mixin
 } = require("./util");
const $ = require("jquery/dist/jquery.min.js");
const { 
  World
 } = require("./systems/world");
const { 
  Simulation
 } = require("./simulation");
let sim = create(Simulation)(120, 240, 3);
global.sim = sim;
const Rendering = { 
  symbol:Symbol("Rendering")
 };
global.world = create(World)(sim.coord, {
  entities: sim.layers.get(),
  weights: []
});
const { 
  Entity
 } = require("./ecs/entity");
const { 
  EntityGroup
 } = require("./ecs/group");
const { 
  Colony
 } = require("./entities/ant");
let green = { 
  red:0,
  green:255,
  blue:0
 };
let yellow = {
  red: 255,
  green: 255,
  blue: 0
};
const { 
  interface
 } = require("./interface");
const Plant = extend(Entity, { 
  symbol:Symbol("Plant"),
  color:green,
  life:50,
  update( pos = this.pos,system = this.system ){ 
    
      return (function() {
        if (Math.round(Math.random()) === 1) {
          var rx = (Math.round(Math.random()) === 1) ? 1 : -1;
          var ry = (Math.round(Math.random()) === 1) ? 1 : -1;
          return this.group.spawn((pos.x + (Math.floor((Math.random() * (2 - 0))) + 0) + rx), (pos.y + (Math.floor((Math.random() * (2 - 0))) + 0) + ry), this.color);
        }
      }).call(this);
    
   }
 });
const PlantGroup = extend(EntityGroup, { 
  symbol:Symbol("PlantGroup"),
  entityType:Plant
 });
Map.prototype.each = (function Map$prototype$each$(f) {
  /* Map.prototype.each eval.sibilant:100:0 */

  this.forEach(f);
  return this;
});
var save = (function save$(path = this.path, components = this.components) {
  /* save deps.sibilant:61:8 */

  return saveJsonFile(path, components);
});
var R = require("ramda");
let setValue = R.curry((value, entity) => {
	
  return entity.value = value;

});
function loadJsonFile( path ){ 
  (new Promise((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return null;
  
  }))
 };
var load = (function load$(path = this.path, entity = this) {
  /* load deps.sibilant:61:8 */

  return loadJsonFile(path).then(setValue(_, entity));
});
var start = (function start$(sim) {
  /* start eval.sibilant:118:0 */

  let plants = create(PlantGroup)();
  let reds = create(Colony)({
    x: 30,
    y: 60
  }, { 
    red:255,
    green:0,
    blue:0
   }, plants);
  global.sim = sim;
  for (let time = 0;time < 100;++(time)){
  reds.spawn()};
  for (let time = 0;time < 100;++(time)){
  plants.random()};
  interface(sim, reds);
  return sim.start().on("tick", (now, ticks) => {
  	
    (function() {
      if ((ticks % 60) === 0) {
        return plants.update();
      }
    }).call(this);
    for (let time = 0;time < 1;++(time)){
    Colony.colonies.each((col) => {
    	
      return col.update();
    
    })};
    return sim.layers.update().render();
  
  });
});
sim.load(start);