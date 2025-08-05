Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1121 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1183 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
var { 
  Spawnable
 } = require("@shared/data-structures/spawnable.js");
const emptyNodes=[];
var Node = Spawnable.define("Node", { 
  init( list = this.list,next = this.next,prev = this.prev,item = this.item ){ 
    
      this.list = list;this.next = next;this.prev = prev;this.item = item;
      return this;
    
   },
  clear(  ){ 
    
      this.list = null;
      this.next = null;
      return this.prev = null;
    
   },
  get isHead(  ){ 
    
      return this === this.list.head;
    
   },
  get isTail(  ){ 
    
      return this === this.list.tail;
    
   },
  bind( list,next,prev ){ 
    
      this.init(list, next, prev);
      return this;
    
   },
  set( item ){ 
    
      this.item = item;
      return this;
    
   }
 });
var List = Spawnable.define("List", { 
  init(  ){ 
    
      
      this.length = 0;
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
      arrayLike.each(((e, i) => {
      	
        return list.push(f(e));
      
      }));
      return list;
    
   },
  clear(  ){ 
    
      return (function() {
        var while$23 = undefined;
        while (this.length > 0) {
          while$23 = (function() {
            return this.pop();
          }).call(this);
        };
        return while$23;
      }).call(this);
    
   },
  of( ...items ){ 
    
      return this.from(items);
    
   },
  push( item ){ 
    
      return this.pushNode(Node.spawn(this, null, null, item)).item;
    
   },
  unshift( item ){ 
    
      return this.unshiftNode(Node.spawn(this, null, null, item)).item;
    
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
      var r = false;
      (function() {
        var while$24 = undefined;
        while ((node && !(r))) {
          while$24 = (function() {
            return (function() {
              if (node.item !== item) {
                return node = node.next;
              } else {
                node = this.removeNode(node);
                return r = node.item;
              }
            }).call(this);
          }).call(this);
        };
        return while$24;
      }).call(this);
      return item;
    
   },
  node( item ){ 
    
      return Node.spawn(this, null, null, item);
    
   },
  pushNode( node ){ 
    
      (function() {
        if (!(this.empty__QUERY)) {
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
        if (!(this.empty__QUERY)) {
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
    
      if( !(node.list === this) ){ 
        throw (new Error("node cannot be removed from a list it is not a part of"))
       };
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
      (function() {
        if (0 > this.length) {
          throw (new Error("negative length"))
        }
      }).call(this);
      (function() {
        if (node) {
          return node.despawn();
        }
      }).call(this);
      return node;
    
   },
  spliceNode( prev,node,next ){ 
    
   },
  sort( predicat,e ){ 
    
   },
  each( f ){ 
    
      var node = this.head;
      (function() {
        var while$25 = undefined;
        while (node) {
          while$25 = (function() {
            f(node.item, node);
            return node = node.next;
          }).call(this);
        };
        return while$25;
      }).call(this);
      return this;
    
   },
  map( f ){ 
    
      var result = create(List)();
      var node = this.head;
      return (function() {
        var while$26 = undefined;
        while (node) {
          while$26 = (function() {
            return result.push(f(node, node.next, node.prev));
          }).call(this);
        };
        return while$26;
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
    
      this.push(this.shift());
      return this;
    
   },
  rotateUntil( predicate = this.predicate ){ 
    
      var r = false;
      var t = 0;
      (function() {
        var while$27 = undefined;
        while ((!(r) && t < this.size)) {
          while$27 = (function() {
            return (function() {
              if (predicate(this.head.item)) {
                return r = this.head.item;
              } else {
                this.rotate();
                return ((t)++);
              }
            }).call(this);
          }).call(this);
        };
        return while$27;
      }).call(this);
      return r;
    
   }
 });
exports.List = List;