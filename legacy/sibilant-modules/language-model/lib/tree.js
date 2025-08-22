

(function(a, b, c) {
  /* ../../node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var Descriptions = {  };
var R = require("ramda");
var fmap = R.curry((f, a) => {
	
  return a.map(f);

});
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../../node_modules/kit/inc/core/fp.sibilant:12:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../../node_modules/kit/inc/core/fp.sibilant:14:0 */

  return () => {
  	
    return (new errType(message));
  
  };
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../../node_modules/kit/inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var Tree = Interface.define("Tree", { 
  init(  ){ 
    
      
      return this;
    
   },
  value:null,
  parent:null,
  depth:0,
  traverseBranches__QUERY:true,
  branch__QUERY( value = this.value ){ 
    
      return null === value;
    
   },
  leaf__QUERY( value = this.value ){ 
    
      return !(null === value);
    
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
            /* ../../node_modules/kit/inc/macros.sibilant:162:9 */
          
            node.depth = (1 + tree.depth);
            return node.insert(seq.slice(1));
          })(tree._insert(seq));
        }
      }).call(this);
    
   },
  set( seq = this.seq,value = this.value,tree = this ){ 
    
      return tree.insert(seq).value = value;
    
   },
  add( key = this.key,tree = this,_children = tree._children ){ 
    
      return (_children.get(key) || create(tree)(undefined, tree));
    
   },
  each( f = this.f,traverseBranches__QUERY = this.traverseBranches__QUERY,leaf__QUERY = this.leaf__QUERY,_children = this._children ){ 
    
      var preorderTraverse = (function preorderTraverse$(node, k) {
        /* preorder-traverse src/tree.sibilant:51:4 */
      
        f(node, k);
        return node.each(f);
      });
      return (function() {
        if (traverseBranches__QUERY) {
          return _children.each(preorderTraverse, true, leaf__QUERY, _children);
        } else {
          return _children.each((node, k) => {
          	
            return (function() {
              if (leaf__QUERY(node)) {
                return f(node, k);
              } else {
                return node.each(f, false, leaf__QUERY, this._children);
              }
            }).call(this);
          
          });
        }
      }).call(this);
    
   }
 });
exports.Tree = Tree;
var TreeMap = Interface.define("TreeMap", { 
  init( value = this.value,parent = this.parent,_children = (new Map()) ){ 
    
      this.value = value;this.parent = parent;this._children = _children;
      return this;
    
   },
  extend:Tree,
  delete( seq = this.seq,tree = this ){ 
    
      var node = tree.find(seq),
          rkeys = seq.reverse();
      console.log("deleting node", node);
      console.log("from tree", tree);
      return rkeys.each((k) => {
      	
        console.log("deleting child", k);
        node.parent._children.delete(k);
        return node = node.parent;
      
      });
    
   },
  _find( seq = this.seq,tree = this,_children = tree._children,node = _children.get(seq[0]) ){ 
    
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
exports.TreeMap = TreeMap;