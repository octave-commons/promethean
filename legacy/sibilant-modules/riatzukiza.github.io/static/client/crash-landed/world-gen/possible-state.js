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
var PossibleState = Spawnable.define("PossibleState", { 
  init( superPosition = this.superPosition,configuration = this.configuration ){ 
    
      this.superPosition = superPosition;this.configuration = configuration;
      return this;
    
   },
  get collapsedState(  ){ 
    
      return this.configuration.get("center");
    
   },
  get tile(  ){ 
    
      return this.superPosition.cell;
    
   },
  get likelyhood(  ){ 
    
      return (function() {
        if (this._likelyhood) {
          return this._likelyhood;
        } else {
          return this._likelyhood = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.superPosition.totalWeight / this.weight);
          }).call(this);
        }
      }).call(this);
    
   },
  get weight(  ){ 
    
      return (function() {
        if (this._weight) {
          return this._weight;
        } else {
          return this._weight = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return this.calculateWeight();
          }).call(this);
        }
      }).call(this);
    
   },
  clear(  ){ 
    
      (function() {
        if (this._weight) {
          (function() {
            if (this._weight.spawn) {
              return this._weight.despawn();
            } else if ((this._weight[0] && this._weight[0].spawn)) {
              return this._weight.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._weight = null;
        }
      }).call(this);
      (function() {
        if (this._likelyhood) {
          (function() {
            if (this._likelyhood.spawn) {
              return this._likelyhood.despawn();
            } else if ((this._likelyhood[0] && this._likelyhood[0].spawn)) {
              return this._likelyhood.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._likelyhood = null;
        }
      }).call(this);
      this.superPosition = null;
      return this.configuration = null;
    
   },
  calculateWeight( configuration = this.configuration ){ 
    
      return configuration.reduce(((weight, tileType, direction) => {
      	return (weight + (configuration.weight * baseWeights[tileType]));
      }), 0);
    
   },
  isValid__QUERY( tile = this.tile,configuration = this.configuration ){ 
    
      if( !(this.weight) ){ 
        return false;
       };
      return configuration.every(((tileType, direction) => {
      	return (direction === "center" || tile[direction].type === tileType || !(tile[direction].type));
      }));
    
   }
 });
export { 
  PossibleState
 };