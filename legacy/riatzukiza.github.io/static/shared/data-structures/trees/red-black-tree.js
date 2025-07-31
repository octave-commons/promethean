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
  BinarySearchTree
 } from "./binary-search-tree.js";
import { 
  List
 } from "../list.js";
var RedBlackTree = BinarySearchTree.define("RedBlackTree", { 
  init( key = null,parent = null,color = "red",values = List.spawn() ){ 
    
      this.key = key;this.parent = parent;this.color = color;this.values = values;
      return this;
    
   },
  get depth(  ){ 
    
      var count = 1;
      var node = this;
      (function() {
        var while$71 = undefined;
        while (node) {
          while$71 = (function() {
            node = node.left;
            return ((count)++);
          }).call(this);
        };
        return while$71;
      }).call(this);
      return count;
    
   },
  get isTimeTraveler__QUERY(  ){ 
    
      return this._parent === this;
    
   },
  get hasRedChild__QUERY(  ){ 
    
      return ((this.left && this.left.isRed__QUERY) || (this.right && this.right.isRed__QUERY));
    
   },
  get isLeftRed__QUERY(  ){ 
    
      return (this.left && this.left.isRed__QUERY);
    
   },
  get isRed__QUERY(  ){ 
    
      return this.color === "red";
    
   },
  get isBlack__QUERY(  ){ 
    
      return this.color === "black";
    
   },
  swapColors( node ){ 
    
      const temp=this.color;
      this.color = node.color;
      return node.color = temp;
    
   },
  fixRedRed(  ){ 
    
      if( this.isRoot__QUERY ){ 
        this.color = "black";;
        return ;
       };
      var parent = this.parent,
          grandparent = parent.parent,
          uncle = this.uncle;
      return (function() {
        if (!(parent.isBlack__QUERY)) {
          return (function() {
            if ((uncle && uncle.isRed__QUERY)) {
              parent.color = "black";
              uncle.color = "black";
              grandparent.color = "red";
              return grandparent.fixRedRed();
            } else {
              return (function() {
                if (parent.isOnLeft__QUERY) {
                  (function() {
                    if (this.isOnLeft__QUERY) {
                      return parent.swapColors(grandparent);
                    } else {
                      parent.rotateLeft();
                      return this.swapColors(grandparent);
                    }
                  }).call(this);
                  return grandparent.rotateRight();
                } else {
                  (function() {
                    if (this.isOnLeft__QUERY) {
                      parent.rotateRight();
                      return this.swapColors(grandparent);
                    } else {
                      return parent.swapColors(grandparent);
                    }
                  }).call(this);
                  return grandparent.rotateLeft();
                }
              }).call(this);
            }
          }).call(this);
        }
      }).call(this);
    
   },
  fixDoubleBlack( sibling = this.sibling,parent = this.parent ){ 
    
      if( this.isRoot__QUERY ){ 
        return ;
       };
      return (function() {
        if (!(sibling)) {
          return parent.fixDoubleBlack();
        } else {
          return (function() {
            if (sibling.isRed__QUERY) {
              parent.color = "red";
              sibling.color = "black";
              (function() {
                if (sibling.isOnLeft__QUERY) {
                  return parent.rotateRight();
                } else {
                  return parent.rotateLeft();
                }
              }).call(this);
              return this.fixDoubleBlack();
            } else {
              return (function() {
                if (sibling.hasRedChild__QUERY) {
                  (function() {
                    if (sibling.isLeftRed__QUERY) {
                      return (function() {
                        if (sibling.isOnLeft__QUERY) {
                          sibling.left.color = sibling.color;
                          sibling.color = parent.color;
                          return parent.rotateRight();
                        } else {
                          sibling.left.color = parent.color;
                          sibling.rotateRight();
                          return parent.rotateLeft();
                        }
                      }).call(this);
                    } else {
                      return (function() {
                        if (sibling.isOnLeft__QUERY) {
                          sibling.right.color = parent.color;
                          sibling.rotateLeft();
                          return parent.rotateRight();
                        } else {
                          sibling.right.color = sibling.color;
                          sibling.color = parent.color;
                          return parent.rotateLeft();
                        }
                      }).call(this);
                    }
                  }).call(this);
                  return parent.color = "black";
                } else {
                  sibling.color = "red";
                  return (function() {
                    if (parent.isBlack__QUERY) {
                      return parent.fixDoubleBlack();
                    } else {
                      return parent.color = "black";
                    }
                  }).call(this);
                }
              }).call(this);
            }
          }).call(this);
        }
      }).call(this);
    
   },
  getReplacementNode(  ){ 
    
      return (function() {
        if (this.hasTwoChildren__QUERY) {
          return this.right.successor;
        } else if (this.isLeaf__QUERY) {
          return null;
        } else {
          return (this.left || this.right);
        }
      }).call(this);
    
   },
  deleteNode( parent = this.parent ){ 
    
      var u = this.getReplacementNode();
      var uvBlack = ((!(u) || u.isBlack__QUERY) && this.isBlack__QUERY);
      if( !(u) ){ 
        (function() {
          if (this.isRoot__QUERY) {
            return this.values.clear();
          } else {
            (function() {
              if (uvBlack) {
                return this.fixDoubleBlack();
              } else if (this.hasSibling__QUERY) {
                return this.sibling.color = "red";
              }
            }).call(this);
            (function() {
              if (this.isOnLeft__QUERY) {
                return parent.left = null;
              } else {
                return parent.right = null;
              }
            }).call(this);
            return this.despawn();
          }
        }).call(this);
        return ;
       };
      if( (!(this.left) || !(this.right)) ){ 
        (function() {
          if (this.isRoot__QUERY) {
            this.swapKeys(u);
            this.left = this.right = null;
            return u.despawn();
          } else {
            (function() {
              if (this.isOnLeft__QUERY) {
                return parent.left = u;
              } else {
                return parent.right = u;
              }
            }).call(this);
            this.despawn();
            u.parent = parent;
            return (function() {
              if (uvBlack) {
                return u.fixDoubleBlack();
              } else {
                return u.color = "black";
              }
            }).call(this);
          }
        }).call(this);
        return ;
       };
      u.swapKeys(this);
      return u.deleteNode();
    
   },
  clear(  ){ 
    
      (function() {
        if (this.values.length > 0) {
          throw (new Error("Cannot clear node with empty bucket"))
        }
      }).call(this);
      const root=this.root;
      this.values.despawn();
      this.parent = null;
      this.left = null;
      this.right = null;
      this.color = null;
      const key=this.key;
      this.key = null;
      const node=root.search(key);
      return (function() {
        if (node === this) {
          throw (new Error("Clearing node that is still in the tree"))
        }
      }).call(this);
    
   },
  deleteByKey( key ){ 
    
      if( !(this.root) ){ 
        return ;
       };
      const node=this.search(key);
      return node.deleteNode();
    
   },
  remove( key = this.key,value = this.value,depth = null ){ 
    
      const node=this.search(key, depth);
      const item=node.values.remove(value);
      (function() {
        if (!(item)) {
          throw (new Error("Trying to remove a value not on this node."))
        }
      }).call(this);
      return (function() {
        if (node.values.length === 0) {
          return node.deleteNode();
        }
      }).call(this);
    
   },
  insert( key = this.key,depth = null ){ 
    
      if( this.isRoot__QUERY ){ 
        if( !(this.key) ){ 
          if( (this.left || this.right) ){ 
            throw (new Error("A root with out a key has children"))
           };
          this.key = key;;
          this.color = "black";;
          return this;
         };
        if( this.key === key ){ 
          return this;
         }
       };
      const temp=this.search(key, depth);
      if( temp.key === key ){ 
        return temp;
       };
      const newNode=RedBlackTree.spawn(key, temp);
      (function() {
        if (key < temp.key) {
          return temp.left = newNode;
        } else {
          return temp.right = newNode;
        }
      }).call(this);
      newNode.fixRedRed();
      return newNode;
    
   },
  search( key = this.key,depth = null ){ 
    
      var temp = this,
          break__QUERY = false;
      while( (temp && !(break__QUERY) && (typeof depth === "number") ? depth > 0 : true) ){ 
        if( typeof depth === "number" ){ 
          ((depth)--)
         };
        if( key < temp.key ){ 
          if( !(temp.left) ){ 
            break
           }else { 
            temp = temp.left;;
            continue
           }
         }else if(key === temp.key){ 
          break
         }else { 
          if( !(temp.right) ){ 
            break
           }else { 
            temp = temp.right;
           }
         }
       };
      return temp;
    
   },
  set( key = this.key,value = this.value,depth = null ){ 
    
      const node=this.insert(key, depth);
      node.values.push(value);
      return node;
    
   }
 });
export { 
  RedBlackTree
 };