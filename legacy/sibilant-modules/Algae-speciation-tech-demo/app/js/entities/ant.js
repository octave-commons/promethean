const { 
  create,
  extend,
  mixin,
  curry
 } = require("../util");
const { 
  Entity
 } = require("../ecs/entity");
const R = require("ramda");
const { 
  EntityGroup
 } = require("../ecs/group");
const { 
  Matrix
 } = require("../matrix");
const { 
  Pheremones
 } = require("../pheremons");
const { 
  weightedRandomElement
 } = require("../random");
const { 
  StateSpace
 } = require("../state-space");
const { 
  complement
 } = require("../color");
var fs = require("browserify-fs");
var mooreNeighborhood = (function mooreNeighborhood$(w = this.w, h = this.h, weight = 1, c = 0) {
  /* moore-neighborhood deps.sibilant:61:8 */

  let m = create(Matrix)([], w, h).dmap((function() {
    /* eval.sibilant:28:57 */
  
    return weight;
  }));
  m.array[matrixCenter(w, h)] = c;
  return m;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each eval.sibilant:18:0 */

  Object.keys(this).each(f);
  return this;
});
var randomColor = (function randomColor$() {
  /* random-color eval.sibilant:21:0 */

  return {
    red: (Math.floor((Math.random() * ( - 255))) + 255),
    green: (Math.floor((Math.random() * ( - 255))) + 255),
    blue: (Math.floor((Math.random() * ( - 255))) + 255)
  };
});
var matrixCenter = (function matrixCenter$(width, height) {
  /* matrix-center eval.sibilant:28:0 */

  return Math.round((((width * height) - 1) / 2));
});
const { 
  eachInArea
 } = require("../area");
// const IndexedSet = { 
//   symbol:Symbol("IndexedSet"),
//   init( memberSet = (new Set()),memberArray = [] ){ 
//     
//       this.memberSet = memberSet;this.memberArray = memberArray;
//       return this;
//     
//    },
//   add( value = this.value,memberSet = this.memberSet,memberArray = this.memberArray ){ 
//     
//       memberArray.push(value);
//       memberSet.add(value);
//       return this;
//     
//    },
//   each( f = this.f,memberArray = this.memberArray ){ 
//     
//       memberArray.each(f);
//       return this;
//     
//    }
//  };
// const System = { 
//   symbol:Symbol("System"),
//   init( entities = createInstance(IndexedSet),handlers = [] ){ 
//     
//       this.entities = entities;this.handlers = handlers;
//       return this;
//     
//    },
//   start(  ){ 
//     
//    },
//   subscribe( entity ){ 
//     
//       return this.entities.add(entity);
//     
//    },
//   update( components ){ 
//     
//       return this.entities.each((entity) => {
//       	
//         return this.handlers.each((handler) => {
//         	
//           return handler(entity, this);
//         
//         });
//       
//       });
//     
//    }
//  };
// const Entity = { 
//   symbol:Symbol("Entity"),
//   init( systems = (new Set()),components = {  } ){ 
//     
//       this.systems = systems;this.components = components;
//       return this;
//     
//    },
//   addSystem( system ){ 
//     
//       this.systems.add(system);
//       return this;
//     
//    },
//   addComponent(  ){ 
//     
//    },
//   update(  ){ 
//     
//       return this.systems.each((system) => {
//       	
//         return system.update(components);
//       
//       });
//     
//    }
//  };
// Entity.define("Ant").valueComponent("life", 1000).valueComponent("collision", world.collision);
const Ant = extend(Entity, { 
  symbol:Symbol("Ant"),
  life:1000,
  collision:world.collision,
  init( pos = this.pos,color = this.color,life = this.life ){ 
    
      this.pos = pos;this.color = color;this.life = life;
      this.genetics = { 
        deviance:(function() {
          /* eval.sibilant:33:8 */
        
          let rand = ((Math.random() * (0.1 - 0)) + 0);
          return (0.1 - (rand / 2));
        }).call(this),
        rate:((Math.random() * (0.5 - 0)) + 0),
        mutationFactor:((Math.random() * (0.5 - 0)) + 0),
        findRate:(function() {
          /* eval.sibilant:33:8 */
        
          let rand = ((Math.random() * (1 - 0)) + 0);
          return (1 - (rand / 2));
        }).call(this),
        returnRate:(function() {
          /* eval.sibilant:33:8 */
        
          let rand = ((Math.random() * (1 - 0)) + 0);
          return (1 - (rand / 2));
        }).call(this),
        kernel:mooreNeighborhood(3, 3).dmap(() => {
        	
          return (function() {
            /* eval.sibilant:33:8 */
          
            let rand = ((Math.random() * (1 - 0)) + 0);
            return (1 - (rand / 2));
          }).call(this);
        
        })
       };
      return this;
    
   },
  get value(  ){ 
    
      return {
        genetics: this.genetics,
        pos: this.pos,
        color: this.color,
        life: this.life
      };
    
   },
  serialize(  ){ 
    
      return JSON.stringify(this.value);
    
   },
  load( path = this.path ){ 
    
      
      return (new Promise((success, fail) => {
      	
        var resolve = success,
            reject = fail;
        return fs.readFile.apply(this, [ path, (err, value) => {
        	
          (function() {
            if (err) {
              return fail(err);
            }
          }).call(this);
          return success(value);
        
        } ]);
      
      })).then(JSON.parse).then((obj) => {
      	
        return create(extend(this, obj))();
      
      });
    
   },
  set value( obj ){ 
    
      return obj.each((v, k) => {
      	
        return this[k] = v;
      
      });
    
   },
  _hasDiscoveredFood( group = this.group ){ 
    
      let true__QUERY = false;
      eachInArea(world.coord, this, (spot, i, j, x, y) => {
      	
        spot = world.collision.entities.get(spot);
        return (function() {
          if ((!(true__QUERY) && group.goals.has(spot))) {
            this._food = spot;
            return true__QUERY = true;
          }
        }).call(this);
      
      }, 5);
      return true__QUERY;
    
   },
  _eat( group = this.group ){ 
    
      group.goals.delete(this._food);
      this.life = (this.life + this._food.life);
      let emission = (this.genetics.rate * this.genetics.findRate * 10);
      this.group.foodWeights.update();
      return this.group.foodWeights.emit(this.pos, group.weights, emission, 20);
    
   },
  _reproduce( nest = this.nest,group = this.group ){ 
    
      this.life = (this.life / 2);
      this.mutate();
      group.spawn();
      this.group.matingWeights.update();
      return this.group.matingWeights.emit(this.pos, group.matingWeights.weights, (10 * this.genetics.rate * (this.life / Ant.life)), 20);
    
   },
  _die( group = this.group ){ 
    
      group.delete(this);
      return this.seeking.emit(this.pos, this.seeking.weights, (-10 * this.genetics.rate * (this.life / Ant.life)), 20);
    
   },
  mutate( group = this.group,nest = this.nest ){ 
    
      this.group.foodWeights.emit(this.pos, group.weights, (this.genetics.rate));
      this.genetics.kernel.dmap((x) => {
      	
        return (x * (function() {
          /* eval.sibilant:33:8 */
        
          let rand = ((Math.random() * (0.2 - 0)) + 0);
          return (0.2 - (rand / 2));
        }).call(this));
      
      });
      this.genetics.returnRate = (this.genetics.returnRate + (function() {
        /* eval.sibilant:33:8 */
      
        let rand = ((Math.random() * (this.genetics.mutationFactor - 0)) + 0);
        return (this.genetics.mutationFactor - (rand / 2));
      }).call(this));this.genetics.findRate = (this.genetics.findRate + (function() {
        /* eval.sibilant:33:8 */
      
        let rand = ((Math.random() * (this.genetics.mutationFactor - 0)) + 0);
        return (this.genetics.mutationFactor - (rand / 2));
      }).call(this));this.genetics.deviance = (this.genetics.deviance + (function() {
        /* eval.sibilant:33:8 */
      
        let rand = ((Math.random() * (this.genetics.mutationFactor - 0)) + 0);
        return (this.genetics.mutationFactor - (rand / 2));
      }).call(this));this.genetics.rate = (this.genetics.rate + (function() {
        /* eval.sibilant:33:8 */
      
        let rand = ((Math.random() * (this.genetics.mutationFactor - 0)) + 0);
        return (this.genetics.mutationFactor - (rand / 2));
      }).call(this));
      return this.life = Ant.life;
    
   },
  _sated( nest = this.nest,ant = this.ant ){ 
    
      let sated__QUERY = this.life > Ant.life;
      (function() {
        if (sated__QUERY) {
          return this.seeking = this.group.matingWeights;
        } else {
          return this.seeking = this.group.foodWeights;
        }
      }).call(this);
      return sated__QUERY;
    
   },
  _nearNest( nest = this.nest ){ 
    
      return (function() {
        /* eval.sibilant:17:8 */
      
        let true__QUERY = false;
        eachInArea(world.coord, this, (spot, i, j, x, y) => {
        	
          return (function() {
            if ((nest.x === x && nest.y === y)) {
              return true__QUERY = true;
            }
          }).call(this);
        
        }, 10);
        return true__QUERY;
      }).call(this);
    
   },
  choose( group = this.group,collision = this.collision ){ 
    
      let count = 0;
      let sum = 0;
      let done = false;
      let choice = {
        x: this.x,
        y: this.y
      };
      (function() {
        if (!(this.genetics.kernel)) {
          return this.genetics.kernel = mooreNeighborhood(3, 3, this.genetics.deviance);
        }
      }).call(this);
      let weights = null;
      var totalWeight = (w, i, j) => {
      	
        return (this.genetics.deviance + (w * (this.life / Ant.life) * this.genetics.kernel.get(i, j)));
      
      };
      eachInArea(this.seeking.weights.state, this, (w, i, j, x, y) => {
      	
        let ent = collision.get(x, y);
        return (function() {
          if ((!(ent) || ent === 0)) {
            return count += totalWeight(w, i, j);
          }
        }).call(this);
      
      }, 3);
      let rand = (count * Math.random());
      eachInArea(this.seeking.weights.state, this, (w, i, j, x, y) => {
      	
        let ent = collision.get(x, y);
        return (function() {
          if ((!(ent) || ent === 0)) {
            sum += totalWeight(w, i, j);
            return (function() {
              if ((rand <= sum && !(done))) {
                choice.x = x;
                choice.y = y;
                return done = true;
              }
            }).call(this);
          }
        }).call(this);
      
      }, 3);
      return choice;
    
   },
  _formNewColony(  ){ 
    
      let sumGroupsLife = (group) => {
      	
        let totalLife = 0;
        group.entities.each((ent) => {
        	
          return totalLife += ent.life;
        
        });
        return totalLife;
      
      };
      let newColony = create(Colony)(this.pos, randomColor(), weightedRandomElement(EntityGroup.groups, sumGroupsLife), (this.group.decay + (function() {
        /* eval.sibilant:33:8 */
      
        let rand = ((Math.random() * (0.0001 - 0)) + 0);
        return (0.0001 - (rand / 2));
      }).call(this)));
      this.group.delete(this);
      newColony.add(this);
      this.group.event.emit("new species", newColony);
      for (let time = 0;time < 10;++(time)){
      this._reproduce()};
      return this.color = newColony.color;
    
   },
  update( group = this.group,nest = this.nest,life = this.life ){ 
    
      let x = 0;
      let y = 0;
      --(this.life);
      let random = (Math.floor((Math.random() * ((Ant.life / 2) - 0))) + 0);
      let sated__QUERY = this._sated();
      (function() {
        if ((2 * this.life) > random) {
          let choice = this.choose();
          this.move(choice.x, choice.y);
          return (function() {
            if (sated__QUERY) {
              return (function() {
                if (this._nearNest()) {
                  return this._reproduce();
                } else if (Math.random() > 0.9999) {
                  return this._formNewColony();
                }
              }).call(this);
            } else if (this._hasDiscoveredFood()) {
              return this._eat();
            }
          }).call(this);
        } else {
          return this._die();
        }
      }).call(this);
      return this.seeking.emit(this.pos, this.seeking.weights, (this.genetics.rate * (this.life / Ant.life)), 10);
    
   }
 });
exports.Ant = Ant;
const { 
  EventEmitter
 } = require("events");
const Colony = extend(EntityGroup, { 
  symbol:Symbol("Colony"),
  colonies:(new Set()),
  entityType:Ant,
  id:0,
  init( nest = this.nest,color = this.color,goals = this.goals,decay = 0.1,colonies = this.colonies,foodWeights = create(Pheremones)(color, decay),matingWeights = create(Pheremones)({ 
    red:color.red,
    green:color.green,
    blue:255
   }, decay),event = (new EventEmitter()),ants = [] ){ 
    
      this.nest = nest;this.color = color;this.goals = goals;this.decay = decay;this.colonies = colonies;this.foodWeights = foodWeights;this.matingWeights = matingWeights;this.event = event;this.ants = ants;
      this.id = ++(Colony.id);
      EntityGroup.init.call(this);
      colonies.add(this);
      return this;
    
   },
  spawn( color = this.color,entityType = this.entityType ){ 
    
      let rx = (Math.round(Math.random()) === 1) ? 1 : -1;
      let ry = (Math.round(Math.random()) === 1) ? 1 : -1;
      let ent = entityType.spawn((this.nest.x + (Math.floor((Math.random() * (30 - 1))) + 1)), (this.nest.y + (Math.floor((Math.random() * (30 - 1))) + 1)), color);
      (function() {
        if (ent) {
          ent.group = this;
          ent.seeking = this.foodWeights;
          this.add(ent);
          this.ants.push(ent);
          ent.nest = this.nest;
          this.event.emit("spawn", ent);
          return ent;
        }
      }).call(this);
      return this;
    
   },
  serialize( ants = this.ants ){ 
    
      return JSON.stringify(ants.toArray().map((ant) => {
      	
        return ant.serialize();
      
      }));
    
   },
  load( path = this.path ){ 
    
      return (new Promise((success, fail) => {
      	
        var resolve = success,
            reject = fail;
        return fs.readFile.apply(this, [ path, (err, value) => {
        	
          (function() {
            if (err) {
              return fail(err);
            }
          }).call(this);
          return success(value);
        
        } ]);
      
      }));
    
   },
  save( path = this.path ){ 
    
      
      return (new Promise((success, fail) => {
      	
        var resolve = success,
            reject = fail;
        return fs.writeFile.apply(this, [ path, this.serialize(), (err, value) => {
        	
          (function() {
            if (err) {
              return fail(err);
            }
          }).call(this);
          return success(value);
        
        } ]);
      
      }));
    
   },
  update( entities = this.entities,weights = this.weights,decay = this.decay,matingWeights = this.matingWeights,foodWeights = this.foodWeights ){ 
    
      "Process the movement of ever ant in a set of ants, updating weights along the way.";
      let update = (ant) => {
      	
        ant.update();
        return ant;
      
      };
      let has = (entities) => {
      	
        return (ant) => {
        	
          return this.entities.has(ant);
        
        };
      
      };
      this.ants = this.ants.each(update).filter(has(entities));
      return (function() {
        if (this.entities.size === 0) {
          this.event.emit("extinct", this);
          return this.colonies.delete(this);
        }
      }).call(this);
    
   }
 });
exports.Colony = Colony;