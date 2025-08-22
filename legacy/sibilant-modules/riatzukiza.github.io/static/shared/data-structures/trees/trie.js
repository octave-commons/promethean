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
  Table
 } from "/shared/data-structures/table.js";
import { 
  Tree
 } from "/shared/data-structures/trees/base.js";
var Trie = Tree.define("Trie", { 
  init( value = this.value,parent = this.parent,_children = Table.spawn() ){ 
    
      this.value = value;this.parent = parent;this._children = _children;
      return this;
    
   },
  get( key ){ 
    
      return this.find(key).value;
    
   },
  set( key = null,value = null ){ 
    
      return this.insert(key).value = value;
    
   },
  clear( value = this.value,_children = this._children,tree = this ){ 
    
      _children.each(((child) => {
      	return child.despawn();
      }));
      tree.value = null;
      tree.parent = null;
      return tree.key = null;
    
   },
  add( key = this.key,tree = this,_children = tree._children ){ 
    
      var node = (_children.get(key) || Trie.spawn(undefined, tree));
      node.key = key;
      return node;
    
   },
  delete( seq = this.seq,tree = this ){ 
    
      var node = tree.find(seq);
      node.parent._children.delete(seq.slice(-1)[0]);
      return node.despawn();
    
   },
  _find( seq = this.seq,node = this._children.get(seq[0]) ){ 
    
      return (function() {
        if (node) {
          return node.find(seq.slice(1));
        } else {
          return false;
        }
      }).call(this);
    
   },
  _insert( seq = this.seq,_children = this._children,tree = this,node = tree.add(seq[0]) ){ 
    
      _children.set(seq[0], node);
      return node;
    
   }
 });
export { 
  Trie
 };