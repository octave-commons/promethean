const { 
  Pheremones
 } = require("./pheremons");
const { 
  Entity
 } = require("./entity");
const { 
  Ant,
  eachWeight,
  mapWeights
 } = require("./ant");
const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  StateSpace
 } = require("./state-space");
let yellow = {
  red: 255,
  green: 255,
  blue: 0
};
const Colony = { 
  symbol:Symbol("Colony"),
  id:1,
  colonies:(new Set()),
  init( name = this.name,nest = this.nest,color = this.color,goals = (new Set()),ants = (new Set()),stats = this.stats,collision = this.collision,weights = create(StateSpace)(120, 120),display = this.display,decay = 0.1,colonies = this.colonies ){ 
    
      this.name = name;this.nest = nest;this.color = color;this.goals = goals;this.ants = ants;this.stats = stats;this.collision = collision;this.weights = weights;this.display = display;this.decay = decay;this.colonies = colonies;
      colonies.add(this);
      return this;
    
   },
  serialize( ants = this.ants ){ 
    
      return ants.toArray().map((ant) => {
      	
        return ant.serialize();
      
      });
    
   },
  save(  ){ 
    
      return create(File)();
    
   },
  load(  ){ 
    
   },
  spawn( count = this.count,nest = this.nest,collision = this.collision ){ 
    
      console.log("spawning ants at nest", nest);
      eachInArea(collision, nest, (spot, i, j, x, y) => {
      	
        return Ant.spawn.call(this, x, y);
      
      }, count);
      return this;
    
   },
  move( ants = this.ants,weights = this.weights,display = this.display,color = this.color,nest = this.nest ){ 
    
      "Process the movement of ever ant in a set of ants, updating weights along the way.";
      ants.each((ant) => {
      	
        return ant.move();
      
      });
      return display.set(nest.x, nest.y, yellow);
    
   }
 };
exports.Colony = Colony;