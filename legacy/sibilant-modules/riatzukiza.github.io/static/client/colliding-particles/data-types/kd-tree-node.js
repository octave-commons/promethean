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
  Vector2D
 } from "./vector-2d.js";
import { 
  DataType
 } from "./data-type.js";
import { 
  BinaryTreeNode
 } from "./binary-tree-node.js";
var KdTreeNode = BinaryTreeNode.define("KdTreeNode", { 
  bucketSize:32,
  keys:[ "x", "y", "pid" ],
  kIndexes:[ "x", "y" ],
  get bucketId(  ){ 
    
      return Math.floor((this.id / this.bucketSize));
    
   },
  get empty__QUERY(  ){ 
    
      return this.pid === -1;
    
   },
  get occupied(  ){ 
    
      return this.pid !== -1;
    
   }
 });
export { 
  KdTreeNode
 };