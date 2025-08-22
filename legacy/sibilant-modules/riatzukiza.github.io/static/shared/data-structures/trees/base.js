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
  PooledDataStructure
 } from "../pooled.js";
var Tree = PooledDataStructure.define("Tree", { 
  value:null,
  parent:null,
  branch__QUERY( value = this.value ){ 
    
      return null === value;
    
   },
  leaf__QUERY( value = this.value ){ 
    
      return !(null === value);
    
   },
  _find(  ){ 
    
      return thow((new Error("Abstract method *find not  defined on Tree")));
    
   },
  _insert(  ){ 
    
      return thow((new Error("Abstract method *insert not  defined on Tree")));
    
   },
  descend( seq = this.seq,f = this.f,tree = this ){ 
    
      return (function() {
        if (0 === seq.length) {
          return tree;
        } else {
          return f(tree, seq);
        }
      }).call(this);
    
   },
  delete( seq = this.seq ){ 
    
   },
  find( seq = this.seq,tree = this ){ 
    
      return (function() {
        if (0 === seq.length) {
          return tree;
        } else {
          return tree._find(seq);
        }
      }).call(this);
    
   },
  has( seq = this.seq,tree = this ){ 
    
      return (function() {
        if (tree.find(seq)) {
          return true;
        } else {
          return false;
        }
      }).call(this);
    
   },
  insert( seq = this.seq,tree = this ){ 
    
      return (function() {
        if (0 === seq.length) {
          return tree;
        } else {
          return (function(node) {
            /* inc/scope.sibilant:12:9 */
          
            return node.insert(seq.slice(1));
          })(tree._insert(seq));
        }
      }).call(this);
    
   },
  set( seq = this.seq,value = this.value,tree = this ){ 
    
      return tree.insert(seq).value = value;
    
   },
  each( f = this.f,condition = this.leaf__QUERY,_children = this._children ){ 
    
      return _children.each(((node, k) => {
      	return (function() {
        if (condition(node)) {
          return f(node, k);
        } else {
          return node.each(f, condition);
        }
      }).call(this);
      }));
    
   }
 });
export { 
  Tree
 };