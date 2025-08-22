var { 
  Interface
 } = require("@kit-js/interface");
var { 
  List
 } = require("@shared/data-structures/list.js");
const emptyNodes=[];
var Node = Interface.define("Node", { 
  init( list = this.list,item = this.item,next = this.next,prev = this.prev ){ 
    
      this.list = list;this.item = item;this.next = next;this.prev = prev;
      return this;
    
   },
  spawn( list,item,next,prev ){ 
    
      return (function() {
        if (emptyNodes.length === 0) {
          return create(Node, list, item, next, prev)();
        } else {
          return emptyNodes.pop().bind(list, next, prev).set(item);
        }
      }).call(this);
    
   },
  despawn(  ){ 
    
      this.list = null;
      this.next = null;
      this.prev = null;
      return emptyNodes.push(this);
    
   },
  get isHead(  ){ 
    
      return this === this.list.head;
    
   },
  get isTail(  ){ 
    
      return this === this.list.tail;
    
   },
  bind( list,next,prev ){ 
    
      return this.init(list, null, next, prev);
    
   },
  set( item ){ 
    
      this.item = item;
      return this;
    
   }
 });
var List = Interface.define("List", { 
  init(  ){ 
    
      
      this.length[0] = undefined;
      return this;
    
   },
  get count(  ){ 
    
      return this.length;
    
   },
  get size(  ){ 
    
      return this.length;
    
   },
  get empty__QUERY(  ){ 
    
      return this.length === 0;
    
   },
  from( arrayLike = this.arrayLike,f = ((a) => {
  	
    return a;
  
  }) ){ 
    
      const list=create(this)();
      return arrayLike.each(((e, i) => {
      	
        return list.push(f(e));
      
      }));
    
   },
  of( ...items ){ 
    
      return this.from(items);
    
   },
  push( item ){ 
    
      return this.pushNode(Node.spawn(this, item, null, null)).item;
    
   },
  unshift( item ){ 
    
      return this.unshiftNode(Node.spawn(this, item, null, null)).item;
    
   },
  pop(  ){ 
    
      return this.popNode().item;
    
   },
  shift(  ){ 
    
      return this.shiftNode().item;
    
   },
  insert( item,predicate ){ 
    
   },
  remove( item ){ 
    
      var node = this.head;
      var success = false;
      return (function() {
        var while$4 = undefined;
        while (node) {
          while$4 = (function() {
            return (function() {
              if (node.item !== item) {
                node = node.next;
                return false;
              } else {
                node = false;
                return this.removeNode(node).item;
              }
            }).call(this);
          }).call(this);
        };
        return while$4;
      }).call(this);
    
   },
  node( item ){ 
    
      return Node.spawn(this, item, null, null);
    
   },
  pushNode( node ){ 
    
      (function() {
        if (!(this.empty)) {
          return this.tail = this.tail.next = node.bind(this, null, this.tail);
        } else {
          return this.head = this.tail = node.bind(this, null, null);
        }
      }).call(this);
      ((this.length)++);
      return node;
    
   },
  unshiftNode( node ){ 
    
      (function() {
        if (!(this.empty)) {
          return this.head = this.head.prev = node.bind(this, this.head, null);
        } else {
          return this.head = this.tail = node.bind(this, null, null);
        }
      }).call(this);
      ((this.length)++);
      return node;
    
   },
  popNode(  ){ 
    
      return (this.empty__QUERY) ? null : this.removeNode(this.tail);
    
   },
  shiftNode(  ){ 
    
      return (this.empty__QUERY) ? null : this.removeNode(this.head);
    
   },
  insertNode( n,predicate ){ 
    
   },
  removeNode( node ){ 
    
      (function() {
        if (!(node.list === this)) {
          return false;
        }
      }).call(this);
      (function() {
        if (node === this.head) {
          return this.head = node.next;
        }
      }).call(this);
      (function() {
        if (node === this.tail) {
          return this.tail = node.prev;
        }
      }).call(this);
      (function() {
        if (node.next) {
          return node.next.prev = node.prev;
        }
      }).call(this);
      (function() {
        if (node.prev) {
          return node.prev.next = node.next;
        }
      }).call(this);
      ((this.length)--);
      node.despawn();
      return node;
    
   },
  spliceNode( prev,node,next ){ 
    
   },
  rotateNode( node = this.node,next = node.next,prev = node.prev ){ 
    
      node.prev = next.prev;
      node.next = node.next;
      next.prev = node.prev;
      next.next = node.next;
      (function() {
        if (node === this.head) {
          return this.head = next;
        }
      }).call(this);
      return (function() {
        if (next === this.tail) {
          return this.tail = node;
        }
      }).call(this);
    
   },
  sort( predicat,e ){ 
    
   },
  each( f ){ 
    
      var node = this.head;
      (function() {
        var while$5 = undefined;
        while (node) {
          while$5 = (function() {
            f(node.item, node);
            return node = node.next;
          }).call(this);
        };
        return while$5;
      }).call(this);
      return this;
    
   },
  map( f ){ 
    
      var result = create(List)();
      var node = this.head;
      return (function() {
        var while$6 = undefined;
        while (node) {
          while$6 = (function() {
            return result.push(f(node, node.next, node.prev));
          }).call(this);
        };
        return while$6;
      }).call(this);
    
   },
  toArray(  ){ 
    
   },
  reduce( f,r ){ 
    
      this.each(((e, i, l) => {
      	
        return r = f(r, e, i, l);
      
      }));
      return r;
    
   },
  findNode( f = this.f,node = this.head ){ 
    
      return (function() {
        if (f(node)) {
          return node;
        } else if (!(node === this.tail)) {
          return List.find(f, node.next);
        } else {
          return false;
        }
      }).call(this);
    
   },
  find( f = this.f,node = this.head ){ 
    
      var r = List.findNode(f, node);
      return (function() {
        if (r) {
          return r.value;
        } else {
          return false;
        }
      }).call(this);
    
   },
  rotate(  ){ 
    
      return this.unshiftNode(this.popNode());
    
   },
  rotateUntil( predicate = this.predicate,t = 0 ){ 
    
      const condition=predicate(this.head.item);
      return (function() {
        if (condition) {
          return this.head.item;
        } else if (t < (this.size - 1)) {
          this.rotate();
          const t_=(t + 1);
          return this.rotateUntil(predicate, t_);
        } else {
          return false;
        }
      }).call(this);
    
   }
 });
exports.List = List;