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
  BinaryTree
 } from "./binary-tree.js";
import { 
  KdTreeNode
 } from "../data-types/kd-tree-node.js";
import { 
  config
 } from "../config.js";
var sample = (function sample$(array, n) {
  /* sample eval.sibilant:6:0 */

  const r=[];
  const visited=(new Set());
  if( n > array.length ){ 
    n = array.length;
   };
  while( n > r.length ){ 
    const i=Math.floor((Math.random() * array.length));;
    const s=array[i];;
    if( !(visited.has(i)) ){ 
      
     };
    visited.add(i);
    r.push(s)
   };
  return r;
});
var KdTree = BinaryTree.define("KdTree", { 
  dataType:KdTreeNode,
  bucketSize:32,
  constructTree( points = this.points,node = this.root,depth = 0 ){ 
    
      if( (node === this.root && depth !== 0) ){ 
        throw (new Error("Root not in root"))
       };
      if( node === this.root ){ 
        for (var data of this.data)
        {
        data.x = 0;;
        data.y = 0;;
        data.pid = -1;
        }
        
       };
      const keys=this.dataType.keys;
      const kIndexes=this.dataType.kIndexes;
      const axis=kIndexes[(depth % kIndexes.length)];
      const sampledPoints=points.sort(((a, b) => {
      	return (a[axis] - b[axis]);
      }));
      const median=sampledPoints[Math.floor((sampledPoints.length / 2))];
      node.x = median.x;
      node.y = median.y;
      node.pid = median.id;
      const axisSplit=median[axis];
      const leftPoints=points.filter(((p) => {
      	return p[axis] < axisSplit;
      }));
      const rightPoints=points.filter(((p) => {
      	return (p !== median && p[axis] >= axisSplit);
      }));
      if( 0 < leftPoints.length ){ 
        if( !(node.left) ){ 
          throw (new Error("Maximum depth exeeded"))
         };
        this.constructTree(leftPoints, node.left, (depth + 1))
       };
      if( 0 < rightPoints.length ){ 
        if( !(node.right) ){ 
          throw (new Error("Maximum depth exeeded"))
         };
        this.constructTree(rightPoints, node.right, (depth + 1))
       };
      return this;
    
   },
  query( x = this.x,y = this.y,range = this.range,min = { 
    x:(x - range),
    y:(y - range)
   },max = { 
    x:(x + range),
    y:(y + range)
   },node = this.root,depth = 0,matches = [],limit = config.groupSize ){ 
    
      if( node.empty__QUERY ){ 
        return matches;
       };
      (function() {
        if (matches.length === limit) {
          return matches;
        }
      }).call(this);
      const kIndexes=this.dataType.kIndexes;
      const axis=kIndexes[(depth % kIndexes.length)];
      if( (node.x > min.x && node.y > min.y && node.x < max.x && node.y < max.y) ){ 
        matches.push(node)
       };
      if( (node.left && node[axis] <= max[axis]) ){ 
        this.query(x, y, range, min, max, node.left, (depth + 1), matches)
       };
      if( (node.right && node[axis] >= min[axis]) ){ 
        this.query(x, y, range, min, max, node.right, (depth + 1), matches)
       };
      return matches;
    
   }
 });
export { 
  KdTree
 };