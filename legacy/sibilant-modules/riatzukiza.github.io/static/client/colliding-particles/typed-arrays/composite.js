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
  DataType
 } from "../data-types/data-type.js";
var CompositeTypedArray = Spawnable.define("CompositeTypedArray", { 
  dataType:DataType,
  init( length = 0,buffer = this.dataType.buffer(length),array = (new Float64Array(buffer)),currentState = this,nextState = this ){ 
    
      this.length = length;this.buffer = buffer;this.array = array;this.currentState = currentState;this.nextState = nextState;
      return this;
    
   },
  get data(  ){ 
    
      return (function() {
        if (this._data) {
          return this._data;
        } else {
          return this._data = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return Array.from(this.generate());
          }).call(this);
        }
      }).call(this);
    
   },
  get elementSize(  ){ 
    
      return this.dataType.size;
    
   },
  fromBuffer( b1 ){ 
    
      return this.spawn((b1.byteLength / this.dataType.bytes), b1);
    
   },
  *generate(  ){ 
  
    for (var i = 0;i < this.length;((i)++))
    {
    yield(this.dataType.spawn(i, this))
    }
    ;
    return null;
  
 }
 });
export { 
  CompositeTypedArray
 };