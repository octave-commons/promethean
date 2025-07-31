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
import '/bundles/external.js';
import { 
  Vector2DArray
 } from "../typed-arrays/vector-2d.js";
import { 
  KdTree
 } from "../typed-arrays/kd-tree.js";
import { 
  ParentSystem
 } from "../system.js";
var KdTreeBuilder = ParentSystem.define("KdTreeBuilder", { 
  dataTypes:[ Vector2DArray, KdTree ],
  async update( args,[ positions, kdTree ] ){ 
  
    kdTree.constructTree(positions.data);
    return null;
  
 }
 });
KdTreeBuilder.start();