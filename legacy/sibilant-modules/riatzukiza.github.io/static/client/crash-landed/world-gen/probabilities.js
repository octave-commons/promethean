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
  TerrainModule
 } from "./terrain-module.js";
import { 
  PossibleState
 } from "./possible-state.js";
import { 
  baseWeights
 } from "./base-weights.js";
import { 
  summate
 } from "/shared/math/math.js";
var ProbabilityDistrobution = Spawnable.define("ProbabilityDistrobution", { 
  get grass(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "grass")))
    
   },
  get stone(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "stone")))
    
   },
  get floweryGrass(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "floweryGrass")))
    
   },
  sampleInverse(  ){ 
    
      var r = Math.random();
      var s = 0;
      var i = 0;
      for (var typeName of [ "grass", "stone", "floweryGrass" ])
      {
      s += (1 - this[typeName]);
      if( s > r ){ 
        return typeName;
       }
      }
      ;
      throw (new Error("You screwed up your math, these probabilities don't add up to 1."))
    
   },
  sample(  ){ 
    
      var r = Math.random();
      var s = 0;
      var i = 0;
      for (var typeName of [ "grass", "stone", "floweryGrass" ])
      {
      s += this[typeName];
      if( s > r ){ 
        return typeName;
       }
      }
      ;
      throw (new Error("You screwed up your math, these probabilities don't add up to 1."))
    
   },
  clear(  ){ 
    
      this.grass = 0;
      this.stone = 0;
      return this.floweryGrass = 0;
    
   }
 });
export { 
  ProbabilityDistrobution
 };
var SuperPositionDistrobution = ProbabilityDistrobution.define("SuperPositionDistrobution", { 
  init( superPosition = this.superPosition ){ 
    
      this.superPosition = superPosition;
      return this;
    
   },
  get grass(  ){ 
    
      return this.superPosition.getLikelyhoodOfState("grass");
    
   },
  get stone(  ){ 
    
      return this.superPosition.getLikelyhoodOfState("stone");
    
   },
  get floweryGrass(  ){ 
    
      return this.superPosition.getLikelyhoodOfState("floweryGrass");
    
   },
  clear(  ){ 
    
      return this.superPosition = null;
    
   }
 });
export { 
  SuperPositionDistrobution
 };
var BaseDistrobution = ProbabilityDistrobution.define("BaseDistrobution", { 
  get totalWeight(  ){ 
    
      return (function() {
        if (this._totalWeight) {
          return this._totalWeight;
        } else {
          return this._totalWeight = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return summate(this.weights);
          }).call(this);
        }
      }).call(this);
    
   },
  get weights(  ){ 
    
      return (function() {
        if (this._weights) {
          return this._weights;
        } else {
          return this._weights = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return this.states.map(((state) => {
            	return (state.weight * baseWeights[state.collapsedState]);
            }));
          }).call(this);
        }
      }).call(this);
    
   },
  get states(  ){ 
    
      return (function() {
        if (this._states) {
          return this._states;
        } else {
          return this._states = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return TerrainModule.modules.map(((chunkType) => {
            	return PossibleState.spawn(this, chunkType);
            }));
          }).call(this);
        }
      }).call(this);
    
   },
  get grass(  ){ 
    
      return (function() {
        if (this._grass) {
          return this._grass;
        } else {
          return this._grass = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.states.reduce(((weight, state) => {
            	return (function() {
              if (state.collapsedState === "grass") {
                return (weight + (state.weight * baseWeights[state.collapsedState]));
              } else {
                return weight;
              }
            }).call(this);
            }), 0) / this.totalWeight);
          }).call(this);
        }
      }).call(this);
    
   },
  get stone(  ){ 
    
      return (function() {
        if (this._stone) {
          return this._stone;
        } else {
          return this._stone = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.states.reduce(((weight, state) => {
            	return (function() {
              if (state.collapsedState === "stone") {
                return (weight + (state.weight * baseWeights[state.collapsedState]));
              } else {
                return weight;
              }
            }).call(this);
            }), 0) / this.totalWeight);
          }).call(this);
        }
      }).call(this);
    
   },
  get floweryGrass(  ){ 
    
      return (function() {
        if (this._floweryGrass) {
          return this._floweryGrass;
        } else {
          return this._floweryGrass = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.states.reduce(((weight, state) => {
            	return (function() {
              if (state.collapsedState === "floweryGrass") {
                return (weight + (state.weight * baseWeights[state.collapsedState]));
              } else {
                return weight;
              }
            }).call(this);
            }), 0) / this.totalWeight);
          }).call(this);
        }
      }).call(this);
    
   },
  clear(  ){ 
    
      (function() {
        if (this._totalWeight) {
          (function() {
            if (this._totalWeight.spawn) {
              return this._totalWeight.despawn();
            } else if ((this._totalWeight[0] && this._totalWeight[0].spawn)) {
              return this._totalWeight.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._totalWeight = null;
        }
      }).call(this);
      (function() {
        if (this._weights) {
          (function() {
            if (this._weights.spawn) {
              return this._weights.despawn();
            } else if ((this._weights[0] && this._weights[0].spawn)) {
              return this._weights.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._weights = null;
        }
      }).call(this);
      (function() {
        if (this._states) {
          (function() {
            if (this._states.spawn) {
              return this._states.despawn();
            } else if ((this._states[0] && this._states[0].spawn)) {
              return this._states.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._states = null;
        }
      }).call(this);
      (function() {
        if (this._grass) {
          (function() {
            if (this._grass.spawn) {
              return this._grass.despawn();
            } else if ((this._grass[0] && this._grass[0].spawn)) {
              return this._grass.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._grass = null;
        }
      }).call(this);
      (function() {
        if (this._stone) {
          (function() {
            if (this._stone.spawn) {
              return this._stone.despawn();
            } else if ((this._stone[0] && this._stone[0].spawn)) {
              return this._stone.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._stone = null;
        }
      }).call(this);
      return (function() {
        if (this._floweryGrass) {
          (function() {
            if (this._floweryGrass.spawn) {
              return this._floweryGrass.despawn();
            } else if ((this._floweryGrass[0] && this._floweryGrass[0].spawn)) {
              return this._floweryGrass.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._floweryGrass = null;
        }
      }).call(this);
    
   }
 });
export { 
  BaseDistrobution
 };
var CurrentDistrobution = ProbabilityDistrobution.define("CurrentDistrobution", { 
  grassInstances:1,
  stoneInstances:1,
  floweryGrassInstances:1,
  get totalInstances(  ){ 
    
      return (this.grassInstances + this.stoneInstances + this.floweryGrassInstances);
    
   },
  get grass(  ){ 
    
      return (this.grassInstances / this.totalInstances);
    
   },
  get stone(  ){ 
    
      return (this.stoneInstances / this.totalInstances);
    
   },
  get floweryGrass(  ){ 
    
      return (this.floweryGrassInstances / this.totalInstances);
    
   }
 });
export { 
  CurrentDistrobution
 };
var ExpectedLikelyhoodGivenCurrentState = ProbabilityDistrobution.define("ExpectedLikelyhoodGivenCurrentState", { 
  base:BaseDistrobution,
  current:CurrentDistrobution,
  get B(  ){ 
    
      return [ this.base.grass, this.base.stone, this.base.floweryGrass ];
    
   },
  get C(  ){ 
    
      return [ (this.current.grass || this.base.grass), (this.current.stone || this.base.stone), (this.current.floweryGrass || this.base.floweryGrass) ];
    
   },
  get E(  ){ 
    
      return this.B.map(((Bn, i) => {
      	return (Bn / this.C[i]);
      }));
    
   },
  get corrected(  ){ 
    
      return this.E.map(((En, i) => {
      	return (En * this.B[i]);
      }));
    
   },
  get totalCorrected(  ){ 
    
      return summate(this.corrected);
    
   },
  get grassCorrection(  ){ 
    
      return this.corrected[0];
    
   },
  get stoneCorrection(  ){ 
    
      return this.corrected[1];
    
   },
  get floweryGrassCorrection(  ){ 
    
      return this.corrected[2];
    
   },
  get grass(  ){ 
    
      return (this.grassCorrection / this.totalCorrected);
    
   },
  get stone(  ){ 
    
      return (this.stoneCorrection / this.totalCorrected);
    
   },
  get floweryGrass(  ){ 
    
      return (this.floweryGrassCorrection / this.totalCorrected);
    
   }
 });
export { 
  ExpectedLikelyhoodGivenCurrentState
 };