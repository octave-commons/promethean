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
  DataType
 } from "./data-type.js";
var BinaryTreeNode = DataType.define("BinaryTreeNode", { 
  occupied:false,
  get left(  ){ 
    
      return this.array.data[((2 * this.id) + 1)];
    
   },
  get right(  ){ 
    
      return this.array.data[((2 * this.id) + 2)];
    
   },
  get parent(  ){ 
    
      return this.data.array[Math.floor(((this.id - 1) / 2))];
    
   },
  clear(  ){ 
    
      DataType.clear.call(this);
      return this.occupied = false;
    
   }
 });
export { 
  BinaryTreeNode
 };