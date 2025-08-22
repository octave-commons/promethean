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
var { 
  Matrix,
  MatrixView,
  Kernel
 } = require("kit/js/matrix"),
    { 
  Tree,
  TreeMap
 } = require("tree-kit");
import { 
  Matrix,
  MatrixView,
  Kernel
 } from "../kit/core/matrix/index.js";
export { 
  Matrix
 };
export { 
  MatrixView
 };
export { 
  kernel
 };
var matrix = create(Matrix);
export { 
  matrix
 };
var kernel = create(Kernel);
export { 
  kernel
 };
var matrixView = create(MatrixView);
export { 
  matrixView
 };
var treeMap = create(TreeMap);
export { 
  treeMap
 };