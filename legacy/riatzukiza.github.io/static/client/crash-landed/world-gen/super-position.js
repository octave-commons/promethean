Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  baseWeights
 } from "./base-weights.js";
import { 
  SuperPositionDistrobution,
  ExpectedLikelyhoodGivenCurrentState,
  CurrentDistrobution
 } from "./probabilities.js";
import { 
  TerrainModule
 } from "./terrain-module.js";
import { 
  PossibleState
 } from "./possible-state.js";
import { 
  summate
 } from "/shared/math/math.js";
var calculateEntropy = (function calculateEntropy$(weights) {
  /* calculate-entropy eval.sibilant:13:0 */

  const sumOfWeights=summate(weights);
  const sumOfLogWeights=weights.reduce(((sum, weight) => {
  	return (sum + (weight * Math.log(weight)));
  }), 0);
  return (Math.log(sumOfWeights) - (sumOfLogWeights / sumOfWeights));
});
var SuperPosition = Spawnable.define("SuperPosition", { 
  init( cell = this.cell,possibleStates = TerrainModule.modules.map(((chunkType) => {
  	return PossibleState.spawn(this, chunkType);
  })) ){ 
    
      this.cell = cell;this.possibleStates = possibleStates;
      return this;
    
   },
  get state(  ){ 
    
      return this.cell.type;
    
   },
  set state( v ){ 
    
      return this.cell.type = v;
    
   },
  get weights(  ){ 
    
      return this.validStates.map(((state) => {
      	return state.weight;
      }));
    
   },
  get totalWeight(  ){ 
    
      return summate(this.weights);
    
   },
  get entropy(  ){ 
    
      const e=calculateEntropy((function() {
        if (this.weights.length) {
          return this.weights;
        } else {
          return [ ((1 * Math.random()) + CurrentDistrobution.grass), ((1 * Math.random()) + CurrentDistrobution.stone), ((1 * Math.random()) + CurrentDistrobution.floweryGrass) ];
        }
      }).call(this));
      (function() {
        if (isNaN(e)) {
          throw (new Error("entropy is NaN"))
        }
      }).call(this);
      return e;
    
   },
  get probabilityDistrobution(  ){ 
    
      return (function() {
        if (this._probabilityDistrobution) {
          return this._probabilityDistrobution;
        } else {
          return this._probabilityDistrobution = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return SuperPositionDistrobution.spawn(this);
          }).call(this);
        }
      }).call(this);
    
   },
  get edges(  ){ 
    
      return (function() {
        if (this._edges) {
          return this._edges;
        } else {
          return this._edges = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            const tile=this.cell;
            return [ tile.north, tile.south, tile.east, tile.west, tile.northEast, tile.northWest, tile.southEast, tile.southWest ];
          }).call(this);
        }
      }).call(this);
    
   },
  get neighbors(  ){ 
    
      return (function() {
        if (this._neighbors) {
          return this._neighbors;
        } else {
          return this._neighbors = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return this.edges.map(((neighbor) => {
            	return neighbor.superPosition;
            }));
          }).call(this);
        }
      }).call(this);
    
   },
  get validStates(  ){ 
    
      return this.getValidStates();
    
   },
  get collapsedNeighbors(  ){ 
    
      return this.neighbors.filter(((superPosition) => {
      	return superPosition.state;
      }));
    
   },
  get uncollapsedNeighbors(  ){ 
    
      return this.neighbors.filter(((superPosition) => {
      	return !(superPosition.state);
      })).sort(((a, b) => {
      	return (a.entropy - b.entropy);
      }));
    
   },
  clear(  ){ 
    
      (function() {
        if (this._probabilityDistrobution) {
          (function() {
            if (this._probabilityDistrobution.spawn) {
              return this._probabilityDistrobution.despawn();
            } else if ((this._probabilityDistrobution[0] && this._probabilityDistrobution[0].spawn)) {
              return this._probabilityDistrobution.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._probabilityDistrobution = null;
        }
      }).call(this);
      (function() {
        if (this._neighbors) {
          (function() {
            if (this._neighbors.spawn) {
              return this._neighbors.despawn();
            } else if ((this._neighbors[0] && this._neighbors[0].spawn)) {
              return this._neighbors.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._neighbors = null;
        }
      }).call(this);
      this.possibleStates.each(((state) => {
      	return state.despawn();
      }));
      this.cell = null;
      return this.possibleStates = null;
    
   },
  getValidStates(  ){ 
    
      return this.possibleStates.filter(((state) => {
      	return state.isValid__QUERY(this.cell);
      }));
    
   },
  getLikelyhoodOfState( tileType ){ 
    
      return (this.validStates.reduce(((typeWeight, state) => {
      	return (function() {
        if (state.collapsedState === tileType) {
          return (typeWeight + state.weight);
        } else {
          return typeWeight;
        }
      }).call(this);
      }), 0) / this.totalWeight);
    
   },
  collapse( depth = 0,maxDepth = 3,overlap = 2,cell = this.cell ){ 
    
      if( this.state ){ 
        return ;
       };
      this.state = (function() {
        if (this.validStates.length === 1) {
          return this.validStates[0].collapsedState;
        } else if (this.validStates.length === 0) {
          return ExpectedLikelyhoodGivenCurrentState.sample();
        } else if ((depth >= maxDepth || !(this.collapsedNeighbors.length))) {
          return this.probabilityDistrobution.sample();
        } else {
          const temp=[];
          var newState = null;
          const neighbors=this.uncollapsedNeighbors;
          const newDepth=(depth + 1);
          for (var neighbor of neighbors)
          {
          temp.push(neighbor);
          neighbor.collapse(newDepth, maxDepth, overlap);
          if( this.validStates.length === 1 ){ 
            newState = this.validStates[0].state;;
            break
           };
          if( this.validStates.length === 0 ){ 
            neighbor.state = null;
           }
          }
          ;
          const r=(function() {
            if (!(newState)) {
              return this.probabilityDistrobution.sample();
            } else {
              return newState;
            }
          }).call(this);
          if( !(newDepth < overlap) ){ 
            for (var neighbor of temp)
            {
            neighbor.state = null;
            }
            
           };
          return r;
        }
      }).call(this);
      return (function() {
        if (depth < overlap) {
          return ((CurrentDistrobution[(this.state + "Instances")])++);
        }
      }).call(this);
    
   }
 });
export { 
  SuperPosition
 };