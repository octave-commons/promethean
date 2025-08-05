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
var DynamicDoubleBuffer = Interface.define("DynamicDoubleBuffer", { 
  get bucketType(  ){ 
    
      const t=Object.create(DoubleBufferedArray);
      t.dataType = this.dataType;
      return t;
    
   },
  bucketSize:256,
  init( length = 0,buckets = [] ){ 
    
      this.length = length;this.buckets = buckets;
      return this;
    
   },
  push( data ){ 
    
      var bucket = this.buckets.slice(-1)[0];
      var elementBucketId = (1 + (this.length - (this.buckets * this.bucketSize)));
      if( elementBucketId > (this.bucketSize - 1) ){ 
        bucket = this.bucketType.spawn(this.bucketSize);;
        this.buckets.push(bucket);
        bucketElementId = 0;
       };
      const lastElement=bucket.data[bucketElementId];
      return for (var key of this.bucketType.keys)
      {
      lastElement[key] = data[key];
      }
      ;
    
   },
  pop(  ){ 
    
   },
  shift(  ){ 
    
   },
  unshift(  ){ 
    
   }
 });