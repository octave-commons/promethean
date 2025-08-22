const { 
  Entity
 } = require("./entity");
const { 
  Pheremones
 } = require("./pheremons");
const { 
  Matrix
 } = require("./matrix");
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
var mooreNeighborhood = (function mooreNeighborhood$(w = this.w, h = this.h, weight = 1, c = 0) {
  /* moore-neighborhood deps.sibilant:61:8 */

  let m = create(Matrix)([], w, h).dmap((function() {
    /* eval.sibilant:40:57 */
  
    return weight;
  }));
  m.array[matrixCenter(w, h)] = c;
  return m;
});
var matrixCenter = (function matrixCenter$(width, height) {
  /* matrix-center eval.sibilant:37:0 */

  return Math.round((((width * height) - 1) / 2));
});
let empty = { id: 0 };
Entity.empty = empty;
let choice = {
  x: 60,
  y: 60
};
function eachWeight( weights = this.weights,pos = this.pos,f = this.f,size = 3,rad = Math.floor((size / 2)) ){ 
  
    "apply a function to every element in a kernel of the weight matrix.\n" +
    "Values are not changed unless done so explicitly by the function as a side effect.";
    return weights.state.eachInSub((pos.x - rad), (pos.y - rad), size, size, (v, i, j, x, y) => {
    	
      return f(v, i, j, (x + i), (y + j));
    
    });
  
 };
exports.eachWeight = eachWeight;
function mapWeights( weights = this.weights,pos = this.pos,f = this.f,size = 3,rad = Math.floor((size / 2)) ){ 
  
    "apply a function to every element in a kernel of the weight matrix,\n" +
    "assigning the weight value to the value returned";
    return eachWeight(weights, pos, (w, i, j, x, y) => {
    	
      return weights.set((x + i), (y + j), f(w, i, j, x, y));
    
    }, size, rad);
  
 };
exports.mapWeights = mapWeights;
const Ant = { 
  symbol:Symbol("Ant"),
  life:1000,
  init( x = this.x,y = this.y,ants = this.ants,goals = this.goals,id = 1,color = this.color,nest = this.nest,weights = this.weights,collision = this.collision,display = this.display,ant = this,life = this.life ){ 
    
      this.x = x;this.y = y;this.ants = ants;this.goals = goals;this.id = id;this.color = color;this.nest = nest;this.weights = weights;this.collision = collision;this.display = display;this.ant = ant;this.life = life;
      this.genetics = { 
        deviance:(function() {
          /* eval.sibilant:7:8 */
        
          let rand = ((Math.random() * (0.1 - 0)) + 0);
          return (0.1 - (rand / 2));
        }).call(this),
        rate:((Math.random() * (0.5 - 0)) + 0),
        mutationFactor:((Math.random() * (0.5 - 0)) + 0),
        findRate:(function() {
          /* eval.sibilant:7:8 */
        
          let rand = ((Math.random() * (1 - 0)) + 0);
          return (1 - (rand / 2));
        }).call(this),
        returnRate:(function() {
          /* eval.sibilant:7:8 */
        
          let rand = ((Math.random() * (1 - 0)) + 0);
          return (1 - (rand / 2));
        }).call(this),
        kernel:mooreNeighborhood(3, 3).dmap(() => {
        	
          return (function() {
            /* eval.sibilant:7:8 */
          
            let rand = ((Math.random() * (1 - 0)) + 0);
            return (1 - (rand / 2));
          }).call(this);
        
        })
       };
      return this;
    
   },
  serialize( genetics = this.genetics,life = this.life ){ 
    
      return { 
        genetics,
        life,
        x,
        y
       };
    
   },
  save( path = this.path,genetics = this.genetics,life = this.life ){ 
    
      return fs.writeFile("./sim.json", JSON.stringify(this.serialize()), (err) => {
      	
        (function() {
          if (err) {
            return this.emit("error", err);
          }
        }).call(this);
        return this.emit("save");
      
      });
    
   },
  load(  ){ 
    
   },
  spawn( x = this.x,y = this.y,color = this.color,ants = this.ants,collision = this.collision ){ 
    
      console.log("spawning ant at", x, y);
      "create an ant of the given type at location given,\n" +
      "if there is not already one present. No ant is created if there is already an ant present.";
      let ent = collision.get(x, y);
      return (function() {
        if ((!(ent) || ent === empty || ent === 0)) {
          let ant = create(extend(Ant, this))(x, y);
          console.log("ant?", x, y);
          ants.add(ant);
          return collision.set(x, y, ant);
        }
      }).call(this);
    
   },
  _hasDiscoveredFood( goals = this.goals,collision = this.collision,ant = this.ant ){ 
    
      let true__QUERY = false;
      eachWeight(collision, ant, (spot, i, j, x, y) => {
      	
        return (function() {
          if ((goals.has(spot) && this.life < 1000)) {
            goals.delete(spot);
            collision.set(x, y, empty);
            return true__QUERY = true;
          }
        }).call(this);
      
      }, 5);
      return true__QUERY;
    
   },
  _eat( weights = this.weights,ant = this.ant ){ 
    
      ant.life = (ant.life + Ant.life);
      let emission = (ant.genetics.rate * ant.genetics.findRate * (ant.life / Ant.life));
      return Pheremones.emit(ant, weights, emission, 120);
    
   },
  _reproduce( nest = this.nest,ant = this.ant,weights = this.weights ){ 
    
      console.log("ant is making babies");
      ant.life = (ant.life / 2);
      ant.mutate();
      ant.spawn(ant.x, ant.y);
      ant.spawn((1 + ant.x), (1 + ant.y));
      return Pheremones.emit(ant, weights, (ant.genetics.rate * (ant.life / Ant.life)), 120);
    
   },
  _die( weights = this.weights,ant = this.ant,ants = this.ants,collision = this.collision ){ 
    
      ants.delete(ant);
      collision.set(ant.x, ant.y, empty);
      return Pheremones.emit(ant, weights, (-1 * ant.genetics.rate * (ant.life / Ant.life)), 120);
    
   },
  mutate( ant = this.ant,weights = this.weights,nest = this.nest ){ 
    
      Pheremones.emit(ant, weights, (ant.genetics.rate));
      ant.genetics.kernel.dmap((x) => {
      	
        return (x * (function() {
          /* eval.sibilant:7:8 */
        
          let rand = ((Math.random() * (0.2 - 0)) + 0);
          return (0.2 - (rand / 2));
        }).call(this));
      
      });
      ant.genetics.returnRate = (ant.genetics.returnRate + (function() {
        /* eval.sibilant:7:8 */
      
        let rand = ((Math.random() * (ant.genetics.mutationFactor - 0)) + 0);
        return (ant.genetics.mutationFactor - (rand / 2));
      }).call(this));ant.genetics.findRate = (ant.genetics.findRate + (function() {
        /* eval.sibilant:7:8 */
      
        let rand = ((Math.random() * (ant.genetics.mutationFactor - 0)) + 0);
        return (ant.genetics.mutationFactor - (rand / 2));
      }).call(this));ant.genetics.deviance = (ant.genetics.deviance + (function() {
        /* eval.sibilant:7:8 */
      
        let rand = ((Math.random() * (ant.genetics.mutationFactor - 0)) + 0);
        return (ant.genetics.mutationFactor - (rand / 2));
      }).call(this));ant.genetics.rate = (ant.genetics.rate + (function() {
        /* eval.sibilant:7:8 */
      
        let rand = ((Math.random() * (ant.genetics.mutationFactor - 0)) + 0);
        return (ant.genetics.mutationFactor - (rand / 2));
      }).call(this));
      return ant.life = Ant.life;
    
   },
  _sated( nest = this.nest,ant = this.ant,collision = this.collision ){ 
    
      return ant.life > Ant.life;
    
   },
  _nearNest( nest = this.nest,ant = this.ant,collision = this.collision ){ 
    
      return (function() {
        /* eval.sibilant:17:8 */
      
        let true__QUERY = false;
        eachWeight(collision, ant, (spot, i, j, x, y) => {
        	
          return (function() {
            if ((nest.x === x && nest.y === y)) {
              return true__QUERY = true;
            }
          }).call(this);
        
        }, 10);
        return true__QUERY;
      }).call(this);
    
   },
  choose( weights = this.weights,collision = this.collision,ant = this ){ 
    
      let count = 0;
      let sum = 0;
      let done = false;
      let choice = {
        x: ant.x,
        y: ant.y
      };
      (function() {
        if (!(ant.genetics.kernel)) {
          return ant.genetics.kernel = mooreNeighborhood(3, 3, ant.genetics.deviance);
        }
      }).call(this);
      let sated__QUERY = (ant._sated()) ? -1 : 1;
      eachWeight(weights, ant, (w, i, j, x, y) => {
      	
        let ent = collision.get(x, y);
        return (function() {
          if ((!(ent) || ent === empty || ent === 0)) {
            return count += (w * sated__QUERY * ant.genetics.kernel.getCell(i, j) * ((Ant.life * ant.life) / ant.genetics.deviance));
          }
        }).call(this);
      
      }, 3);
      let rand = (count * Math.random());
      eachWeight(weights, ant, (w, i, j, x, y) => {
      	
        let ent = collision.get(x, y);
        return (function() {
          if ((!(ent) || ent === empty || ent === 0)) {
            sum += (w * sated__QUERY * ant.genetics.kernel.getCell(i, j) * ant.genetics.deviance * ((Ant.life * ant.life) / ant.genetics.deviance));
            return (function() {
              if ((rand < sum && !(done))) {
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
  move( weights = this.weights,ants = this.ants,nest = this.nest,collision = this.collision,life = this.life,ant = this ){ 
    
      let x = 0;
      let y = 0;
      --(ant.life);
      let random = (Math.floor((Math.random() * ((Ant.life / 2) - 0))) + 0);
      let sated__QUERY = ant._sated();
      (function() {
        if ((2 * ant.life) > random) {
          let choice = ant.choose();
          Entity.move.call(ant, choice.x, choice.y);
          return (function() {
            if (ant._hasDiscoveredFood()) {
              return ant._eat();
            } else if (sated__QUERY) {
              return (function() {
                if (ant._nearNest()) {
                  return ant._reproduce();
                }
              }).call(this);
            }
          }).call(this);
        } else {
          return ant._die();
        }
      }).call(this);
      return Pheremones.emit(ant, weights, (ant.genetics.rate * (0.1 * (ant.life / Ant.life))), 7);
    
   }
 };
exports.Ant = Ant;