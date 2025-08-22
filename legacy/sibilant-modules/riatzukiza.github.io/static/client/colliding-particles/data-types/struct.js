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
var StructType = Spawnable.define("StructType", { 
  init( id = this.id,typedArrays = this.typedArrays ){ 
    
      this.id = id;this.typedArrays = typedArrays;
      for (var array of typedArrays)
      {
      this[array.dataType.key] = array.data[id];
      }
      ;
      return this;
    
   }
 });
var Struct = Spawnable.define("Struct", { 
  get keys(  ){ 
    
      return (function() {
        if (this._keys) {
          return this._keys;
        } else {
          return this._keys = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return Object.keys(this).filter(((key) => {
            	return [ "length", "_dataTypes", "_typedArrays", "_data" ].includes(key);
            }));
          }).call(this);
        }
      }).call(this);
    
   },
  get dataTypes(  ){ 
    
      return (function() {
        if (this._dataTypes) {
          return this._dataTypes;
        } else {
          return this._dataTypes = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return this.keys.map(((key) => {
            	const dt=this[key];
            dt.key = key;
            return dt;
            }));
          }).call(this);
        }
      }).call(this);
    
   },
  build( keys = this.keys,dataTypes = this.dataTypes ){ 
    
   },
  get typedArrays(  ){ 
    
      return (function() {
        if (this._typedArrays) {
          return this._typedArrays;
        } else {
          return this._typedArrays = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return this.dataTypes.map(((dt) => {
            	return dt.spawn(this.length);
            }));
          }).call(this);
        }
      }).call(this);
    
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
  init( length = this.length ){ 
    
      this.length = length;
      return this;
    
   },
  *generate(  ){ 
  
    return for (var i = 0;i < this.length;((i)++))
    {
    yield(StructType.spawn(i, this.typedArrays))
    }
    ;
  
 },
  clear(  ){ 
    
      (function() {
        if (this._data) {
          (function() {
            if (this._data.spawn) {
              return this._data.despawn();
            } else if ((this._data[0] && this._data[0].spawn)) {
              return this._data.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._data = null;
        }
      }).call(this);
      (function() {
        if (this._typedArrays) {
          (function() {
            if (this._typedArrays.spawn) {
              return this._typedArrays.despawn();
            } else if ((this._typedArrays[0] && this._typedArrays[0].spawn)) {
              return this._typedArrays.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._typedArrays = null;
        }
      }).call(this);
      (function() {
        if (this._keys) {
          (function() {
            if (this._keys.spawn) {
              return this._keys.despawn();
            } else if ((this._keys[0] && this._keys[0].spawn)) {
              return this._keys.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._keys = null;
        }
      }).call(this);
      (function() {
        if (this._dataTypes) {
          (function() {
            if (this._dataTypes.spawn) {
              return this._dataTypes.despawn();
            } else if ((this._dataTypes[0] && this._dataTypes[0].spawn)) {
              return this._dataTypes.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._dataTypes = null;
        }
      }).call(this);
      return this.length = null;
    
   }
 });