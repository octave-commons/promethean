const R = require("ramda");
const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  StateSpace
 } = require("./state-space");
const { 
  euclidianDistance
 } = require("./math");
const { 
  complement
 } = require("./color");
let colors = [];
function decayPositive( x,y,v,decay,color ){ 
  
    "brings a positive weight closer to zero, ";
    return (v - decay);
  
 };
var combine = (function combine$(old, addi) {
  /* combine eval.sibilant:24:0 */

  return Math.round((old + addi));
});
function decayNegative( x,y,v,decay,color ){ 
  
    "brings a positive weight closer to zero, ";
    return (v + decay);
  
 };
function eachInArea( matrix = this.matrix,pos = this.pos,f = this.f,size = 3,rad = Math.floor((size / 2)) ){ 
  
    "apply a function to every element in a kernel of the weight matrix.\n" +
    "Values are not changed unless done so explicitly by the function as a side effect.";
    return matrix.eachInSub((pos.x - rad), (pos.y - rad), size, size, (v, i, j, x, y) => {
    	
      return f(v, i, j, (x + i), (y + j));
    
    });
  
 };
const Weight = { 
  symbol:Symbol("Weight"),
  init( x = this.x,y = this.y,entity = this.entity ){ 
    
      this.x = x;this.y = y;this.entity = entity;
      return this;
    
   },
  get weight(  ){ 
    
      return weights.get(x, y);
    
   },
  get color(  ){ 
    
      return (function() {
        if (this.weight >= 0) {
          return entity.color;
        } else {
          return complement(entity.color);
        }
      }).call(this);
    
   },
  get r(  ){ 
    
      return this.color.red;
    
   },
  get g(  ){ 
    
      return this.color.green;
    
   },
  get b(  ){ 
    
      return this.color.blue;
    
   },
  get a(  ){ 
    
      return Math.abs((160 * this.weight));
    
   }
 };
var addMixingLayer = (function addMixingLayer$(entity, weights) {
  /* add-mixing-layer eval.sibilant:56:0 */

  let layer = sim.layers.get();
  weights.layer = layer;
  weights.each((w, x, y) => {
  	
    return layer.add(create(Weight)(x, y, entity));
  
  });
  return layer.moveUp();
});
var decay = (function decay$(coord, v, decay) {
  /* decay eval.sibilant:64:0 */

  let { 
    x,
    y
   } = coord;
  return (function() {
    if (decay < Math.abs(v)) {
      return (function() {
        if (v > 0) {
          return (v - decay);
        } else if (v < 0) {
          return (v + decay);
        }
      }).call(this);
    } else {
      return 0;
    }
  }).call(this);
});
var memoize = (function memoize$(f) {
  /* memoize eval.sibilant:71:0 */

  let cache = (new Array(f.length)).map(() => {
  	
    return (new Map());
  
  });
  return (...args) => {
  	
    return (function() {
      {
        return cache.every((cache, i) => {
        	
          return cache.has(args[i]);
        
        });
      }
    }).call(this);
  
  };
});
const Pheremones = { 
  symbol:Symbol("Pheremones"),
  id:0,
  init( color = this.color,decay = this.decay,decaying = {
    waiting: [],
    marked: (new Set())
  },weights = create(StateSpace)(sim.width, sim.width),id = this.id,lastUpdate = 0 ){ 
    
      this.color = color;this.decay = decay;this.decaying = decaying;this.weights = weights;this.id = id;this.lastUpdate = lastUpdate;
      ++(Pheremones.id);
      return this;
    
   },
  update( decaying = this.decaying,id = this.id,dec = this.decay,weights = this.weights ){ 
    
      let debt = (sim.ticks - this.lastUpdate);
      this.lastUpdate = sim.ticks;
      return this.decaying.waiting = decaying.waiting.filter((coord) => {
      	
        let w = decay(coord, coord.layers[id], (debt * dec));
        coord.layers[id] = w;
        weights.set(coord.x, coord.y, w);
        return (function() {
          if (w <= 0) {
            decaying.marked.delete(coord);
            return false;
          } else {
            return true;
          }
        }).call(this);
      
      });
    
   },
  emit( pos = this.pos,weights = this.weights,rate = this.rate,r = 5,decaying = this.decaying,id = this.id ){ 
    
      return eachInArea(weights.state, pos, (w, i, j, x, y) => {
      	
        let coord = world.coord.get(x, y);
        (function() {
          if (!(decaying.marked.has(coord))) {
            decaying.marked.add(coord);
            decaying.waiting.push(coord);
            return coord.layers[id] = w;
          }
        }).call(this);
        return (function() {
          if (w < 1) {
            return coord.layers[id] += (rate / (1 + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
          }
        }).call(this);
      
      }, r);
    
   }
 };
exports.Pheremones = Pheremones;