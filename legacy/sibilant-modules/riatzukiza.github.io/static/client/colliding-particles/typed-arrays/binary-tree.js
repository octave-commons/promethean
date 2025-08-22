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
  DoubleBufferedArray
 } from "./double-buffered.js";
import { 
  BinaryTreeNode
 } from "../data-types/binary-tree-node.js";
var BinaryTree = DoubleBufferedArray.define("BinaryTree", { 
  dataType:BinaryTreeNode,
  get root(  ){ 
    
      return this.data[0];
    
   }
 });
export { 
  BinaryTree
 };