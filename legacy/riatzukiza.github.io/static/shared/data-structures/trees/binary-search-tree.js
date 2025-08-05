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
  Spawnable
 } from "../spawnable.js";
import { 
  
 } from "../list.js";
var BinarySearchTree = Spawnable.define("BinarySearchTree", { 
  init( key = null,parent = null,values = List.spawn() ){ 
    
      this.key = key;this.parent = parent;this.values = values;
      return this;
    
   },
  get hasOneChild__QUERY(  ){ 
    
      return (!(this.left) || !(this.right));
    
   },
  get hasTwoChildren__QUERY(  ){ 
    
      return (this.left && this.right);
    
   },
  get root(  ){ 
    
      var node = this;
      (function() {
        var while$64 = undefined;
        while (node.parent) {
          while$64 = (function() {
            return node = node.parent;
          }).call(this);
        };
        return while$64;
      }).call(this);
      return node;
    
   },
  get grandparent(  ){ 
    
      return this.parent.parent;
    
   },
  get isLeaf__QUERY(  ){ 
    
      return (!(this.left) && !(this.right));
    
   },
  get successor(  ){ 
    
      var temp = this;
      (function() {
        var while$65 = undefined;
        while (temp.left) {
          while$65 = (function() {
            return temp = temp.left;
          }).call(this);
        };
        return while$65;
      }).call(this);
      return temp;
    
   },
  get isRoot__QUERY(  ){ 
    
      return !(this.parent);
    
   },
  get uncle(  ){ 
    
      return (function() {
        if ((!(this.parent) || !(this.grandparent))) {
          return null;
        } else if (this.parent.isOnLeft__QUERY) {
          return this.grandparent.right;
        } else {
          return this.grandparent.left;
        }
      }).call(this);
    
   },
  get isOnLeft__QUERY(  ){ 
    
      return this === this.parent.left;
    
   },
  get sibling(  ){ 
    
      return (function() {
        if (!(this.parent)) {
          return null;
        } else if (this.isOnLeft__QUERY) {
          return this.parent.right;
        } else {
          return this.parent.left;
        }
      }).call(this);
    
   },
  moveDown( nParent ){ 
    
      (function() {
        if (this.parent) {
          return (function() {
            if (this.isOnLeft__QUERY) {
              return this.parent.left = nParent;
            } else {
              return this.parent.right = nParent;
            }
          }).call(this);
        }
      }).call(this);
      nParent.parent = this.parent;
      return this.parent = nParent;
    
   },
  swapKeys( node ){ 
    
      const temp=this.key;
      const temp2=this.values;
      this.key = node.key;
      this.values = node.values;
      node.key = temp;
      return node.values = temp2;
    
   },
  rotateLeft(  ){ 
    
      const nParent=this.right;
      this.moveDown(nParent);
      this.right = nParent.left;
      (function() {
        if (nParent.left) {
          return nParent.left.parent = this;
        }
      }).call(this);
      return nParent.left = this;
    
   },
  rotateRight(  ){ 
    
      const nParent=this.left;
      this.moveDown(nParent);
      this.left = nParent.right;
      (function() {
        if (nParent.right) {
          return nParent.right.parent = this;
        }
      }).call(this);
      return nParent.right = this;
    
   },
  set( key = this.key,value = this.value ){ 
    
      (function() {
        if ((!(this.key) || key === this.key)) {
          this.key = key;
          return this.values.push(value);
        } else if (key < this.key) {
          return (function() {
            if (this.left) {
              return this.left.set(key, value);
            } else {
              return this.left = BinarySearchTree.spawn(null, this).set(key, value);
            }
          }).call(this);
        } else if (key > this.key) {
          return (function() {
            if (this.right) {
              return this.right.set(key, value);
            } else {
              return this.right = BinarySearchTree.spawn(null, this).set(key, value);
            }
          }).call(this);
        }
      }).call(this);
      return this;
    
   },
  map( f ){ 
    
      const r=this.proto.spawn();
      this.each(((node, k) => {
      	return r.set(k, f(node, k));
      }));
      return r;
    
   },
  eachNode( f ){ 
    
      (function() {
        if (this.left) {
          return this.left.eachNode(f);
        }
      }).call(this);
      (function() {
        if (this.right) {
          return this.right.eachNode(f);
        }
      }).call(this);
      return f(this);
    
   },
  each( f ){ 
    
      (function() {
        if (this.left) {
          return this.left.each(f);
        }
      }).call(this);
      (function() {
        if (this.right) {
          return this.right.each(f);
        }
      }).call(this);
      return this.values.each(((v) => {
      	return f(v, this, this.key);
      }));
    
   },
  remove( key,value ){ 
    
      `
      shared/datastructures/trees/binary-search-tree/remove.md

      # shared.datastructures.trees.binary-search-tree.remove

      ## arguments

      key: A numeric key, value: A value to be removed.

      ## description

      Search the tree as deep as needed to find and remove a value`

      ;
      const branch=this.search(key);
      return (function() {
        if (branch.values.remove(value)) {
          return (function() {
            if (branch.values.length === 0) {
              return this.key = null;
            }
          }).call(this);
        }
      }).call(this);
    
   },
  prune( key ){ 
    
      return `
      shared/datastructures/trees/binary-search-tree/prune.md

      # shared.datastructures.trees.binary-search-tree.prune

      ## arguments

      key: A numeric key

      ## description

      Search the tree for a key, removing the branch`

      ;
    
   },
  search( key = this.key ){ 
    
      `
      shared/datastructures/trees/binary-searchtree/search.md

      # shared.datastructures.trees.binary-searchtree.search

      ## arguments

      key: A numeric key.

      ## description

      Search the tree for a key, returning the branch.`

      ;
      return (function() {
        if (key === this.key) {
          return this;
        } else if ((key < this.key && this.left)) {
          return this.left.search(key);
        } else if ((key > this.key && this.right)) {
          return this.right.search(key);
        } else {
          return this;
        }
      }).call(this);
    
   },
  findRange( low = this.low,high = this.high,answer = [] ){ 
    
      (function() {
        if ((this.key >= low && this.key <= high)) {
          (function() {
            if (this.left) {
              return this.left.findRange(low, high, answer);
            }
          }).call(this);
          answer.push(this);
          return (function() {
            if (this.right) {
              return this.right.findRange(low, high, answer);
            }
          }).call(this);
        } else if ((this.key < low && this.right)) {
          return this.right.findRange(low, high, answer);
        } else if (this.left) {
          return this.left.findRange(low, high, answer);
        }
      }).call(this);
      return answer;
    
   },
  forEachInRange( low = this.low,high = this.high,f = (() => {
  	return null;
  }) ){ 
    
      return (function() {
        if ((this.key >= low && this.key <= high)) {
          (function() {
            if (this.left) {
              return this.left.forEachInRange(low, high, f);
            }
          }).call(this);
          this.values.each(f);
          return (function() {
            if (this.right) {
              return this.right.forEachInRange(low, high, f);
            }
          }).call(this);
        } else if ((this.key < low && this.right)) {
          return this.right.forEachInRange(low, high, f);
        } else if (this.left) {
          return this.left.forEachInRange(low, high, f);
        }
      }).call(this);
    
   }
 });
export { 
  BinarySearchTree
 };