require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@shared/data-structures/trees/bst-buckets.js":[function(require,module,exports){
var { 
  Spawnable
 } = require("@shared/data-structures/spawnable.js"),
    { 
  List
 } = require("@shared/data-structures/list.js");
var BinarySearchTree = Spawnable.define("BinarySearchTree", { 
  init( key = null,depth = 50,parent = null,_root = (function() {
    if (!(parent)) {
      return this;
    } else {
      return parent.root;
    }
  }).call(this),values = List.spawn() ){ 
    
      this.key = key;this.depth = depth;this.parent = parent;this._root = _root;this.values = values;
      return this;
    
   },
  get root(  ){ 
    
      return (function() {
        if (this._root.isRoot__QUERY) {
          return this._root;
        } else if (!(this._root)) {
          return null;
        } else {
          var node = this;
          return this._root = (function() {
            var while$193 = undefined;
            while (node.parent) {
              while$193 = (function() {
                return node = node.parent;
              }).call(this);
            };
            return while$193;
          }).call(this);
        }
      }).call(this);
    
   },
  set root( v ){ 
    
      return (function() {
        if (v) {
          v.parent = null;
          return this._root = v;
        }
      }).call(this);
    
   },
  get grandparent(  ){ 
    
      return this.parent.parent;
    
   },
  get isLeaf__QUERY(  ){ 
    
      return (!(this.left) && !(this.right));
    
   },
  get successor(  ){ 
    
      var temp = this;
      return (function() {
        var while$194 = undefined;
        while (temp.left) {
          while$194 = (function() {
            return temp = temp.left;
          }).call(this);
        };
        return while$194;
      }).call(this);
    
   },
  get isRoot__QUERY(  ){ 
    
      return !(this.parent);
    
   },
  get uncle(  ){ 
    
      return (function() {
        if ((this.isRoot__QUERY || this.parent.isRoot__QUERY)) {
          return null;
        } else if (this.parent.isOnLeft__QUERY) {
          return this.parent.parent.right;
        } else {
          return this.parent.parent.left;
        }
      }).call(this);
    
   },
  get isOnLeft__QUERY(  ){ 
    
      return this === this.parent.left;
    
   },
  get sibling(  ){ 
    
      return (function() {
        if (this.isRoot__QUERY) {
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
    
      const temp=node.key;
      this.key = node.key;
      return node.key = temp;
    
   },
  rotateLeft(  ){ 
    
      var x = this;
      var y = x.right;
      x.right = y.left;
      (function() {
        if (y.left) {
          return y.left.parent = x;
        }
      }).call(this);
      y.left = x.parent;
      (function() {
        if (!(x.parent)) {
          return y.parent = null;
        } else if (x === x.parent.left) {
          return x.parent.left = y;
        } else {
          return x.parent.right = y;
        }
      }).call(this);
      y.left = x;
      x.parent = y;
      ((y.depth)++);
      return ((x.depth)--);
    
   },
  rotateRight(  ){ 
    
      var x = this;
      var y = x.left;
      x.left = y.right;
      (function() {
        if (y.right) {
          return y.right.parent = x;
        }
      }).call(this);
      (function() {
        if (!(x.parent)) {
          return y.right = null;
        } else if (x === x.parent.right) {
          return x.parent.right = y;
        } else {
          return x.parent.left = y;
        }
      }).call(this);
      y.right = x;
      return x.parenty = undefined;
    
   },
  set( key = null,value = this.value,depth = this.depth ){ 
    
      (function() {
        if ((!(this.key) || key === this.key || depth === 0)) {
          this.key = key;
          return this.values.push(value);
        } else if (key < this.key) {
          return (function() {
            if (this.left) {
              return this.left.set(key, value);
            } else {
              return this.left = BinarySearchTree.spawn(null, (depth - 1), this).set(key, value);
            }
          }).call(this);
        } else if (key > this.key) {
          return (function() {
            if (this.right) {
              return this.right.set(key, value);
            } else {
              return this.right = BinarySearchTree.spawn(null, (depth - 1), this).set(key, value);
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
  each( f ){ 
    
      this.values.each(((v) => {
      	
        return f(v, this.key);
      
      }));
      this.left.each(f);
      return this.right.each(f);
    
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
      const branch=this.search(key, this.depth);
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
  prune( key,depth ){ 
    
      return `
      shared/datastructures/trees/binary-search-tree/prune.md

      # shared.datastructures.trees.binary-search-tree.prune

      ## arguments

      key: A numeric key, depth: How far to  traverse the tree before cutting off

      ## description

      Search the tree to a given depth for a key, removing the branch at the depth.`

      ;
    
   },
  search( key = this.key,depth = this.depth ){ 
    
      `
      shared/datastructures/trees/binary-searchtree/search.md

      # shared.datastructures.trees.binary-searchtree.search

      ## arguments

      key: A numeric key, depth: How far down the tree to search.

      ## description

      Search the tree to a given depth for a key, returning the branch at the requested depth.`

      ;
      return (function() {
        if ((depth === 0 || key === this.key)) {
          return this;
        } else if ((key < this.key && this.left)) {
          return this.left.search(key, (depth - 1));
        } else if ((key > this.key && this.right)) {
          return this.right.search(key, (depth - 1));
        } else {
          return this;
        }
      }).call(this);
    
   }
 });
exports.BinarySearchTree = BinarySearchTree;
},{"@shared/data-structures/list.js":"@shared/data-structures/list.js","@shared/data-structures/spawnable.js":"@shared/data-structures/spawnable.js"}]},{},[]);
