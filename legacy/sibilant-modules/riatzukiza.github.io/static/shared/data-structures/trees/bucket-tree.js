var { 
  Interface
 } = require("@kit-js/interface");
var { 
  TreeMap
 } = require("@shared/data-structures/contrib.js"),
    { 
  OrderedMap
 } = require("@shared/data-structures/maps/ordered.js");
var BucketedTree = TreeMap.define("BucketedTree", { 
  init( value = [],parent = this.parent,_children = create(OrderedMap)() ){ 
    
      this.value = value;this.parent = parent;this._children = _children;
      return this;
    
   }
 });
exports.BucketedTree = BucketedTree;