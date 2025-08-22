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
var DataType = Spawnable.define("DataType", { 
  keys:[],
  init( id = this.id,array = this.array ){ 
    
      this.id = id;this.array = array;
      return this;
    
   },
  get index(  ){ 
    
      return (this.size * this.id);
    
   },
  get size(  ){ 
    
      return this.keys.length;
    
   },
  get bytes(  ){ 
    
      return (this.size * Float64Array.BYTES_PER_ELEMENT);
    
   },
  clear(  ){ 
    
      for (var key of this.keys)
      {
      this[key] = 0;
      }
      ;
      return null;
    
   },
  buffer( length ){ 
    
      return (new SharedArrayBuffer((length * this.bytes)));
    
   },
  build(  ){ 
    
      return this.keys.each(((key, i) => {
      	return Object.defineProperty(this, key, { 
        get(  ){ 
          
            return this.array.currentState.array[(this.index + i)];
          
         },
        set( value ){ 
          
            return this.array.nextState.array[(this.index + i)] = value;
          
         }
       });
      }));
    
   }
 });
export { 
  DataType
 };