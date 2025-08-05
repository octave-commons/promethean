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
var Heapable = Spawnable.define("Heapable", { 
  get heap(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "heap")))
    
   },
  get index(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "index")))
    
   },
  get compareTo(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "compareTo")))
    
   },
  get rightIndex(  ){ 
    
      return ((2 * this.index) + 2);
    
   },
  get leftIndex(  ){ 
    
      return ((2 * this.index) + 1);
    
   },
  get parentIndex(  ){ 
    
      return Math.floor(((this.index - 1) / 2));
    
   },
  getParentIndex( index = this.index ){ 
    
      return Math.floor(((index - 1) / 2));
    
   },
  get smallestChildIndex(  ){ 
    
      return (function() {
        if ((this.rightIndex >= this.heap.length || this.heap[this.leftIndex].priority < this.heap[this.rightIndex].priority)) {
          return this.leftIndex;
        } else {
          return this.rightIndex;
        }
      }).call(this);
    
   },
  get root(  ){ 
    
      return this.heap[0];
    
   },
  get minVal(  ){ 
    
      return this.root;
    
   },
  get left(  ){ 
    
      return this.heap[this.leftIndex];
    
   },
  get right(  ){ 
    
      return this.heap[this.rightIndex];
    
   },
  get parent(  ){ 
    
      return this.heap[this.parentIndex];
    
   }
 });
export { 
  Heapable
 };
var BinaryHeap = Heapable.define("BinaryHeap", { 
  interface:Heapable,
  get heap(  ){ 
    
      return this._heap;
    
   },
  get index(  ){ 
    
      return this._index;
    
   },
  set index( v ){ 
    
      return this._index = v;
    
   },
  init( _heap = [] ){ 
    
      this._heap = _heap;
      return this;
    
   },
  clear(  ){ 
    
      return this.heap.length = 0;
    
   },
  includes( heapable = this.heapable,heap = this.heap ){ 
    
      return heapable === heap[heapable.index];
    
   },
  heapify( _heap = this._heap ){ 
    
      for (var heapable of _heap)
      {
      this._siftDown(heapable.index, heapable.leftIndex, heapable.rightIndex, _heap)
      }
      ;
      return _heap;
    
   },
  getMin(  ){ 
    
      return this.root;
    
   },
  updateByIndex( index = this.index,heap = this.heap ){ 
    
      const node=heap[index];
      return this._siftUp(index, node.parentIndex, heap);
    
   },
  extractMin( minVal = this.minVal,heap = this.heap ){ 
    
      if( !(heap.length) ){ 
        return null;
       };
      var newRoot = heap.slice(-1)[0];
      heap[0] = newRoot;
      heap.slice(-1)[0] = minVal;
      newRoot.index = 0;
      minVal.index = null;
      heap.pop();
      this._siftDown(0, newRoot.leftIndex, newRoot.rightIndex);
      return minVal;
    
   },
  insert( heapable = this.heapable,heap = this.heap ){ 
    
      if( !(heapable.heap) ){ 
        throw (new TypeError("Inserting non heapable value"))
       };
      if( heapable.heap !== heap ){ 
        throw (new TypeError("Inserting heapable to wrong heap"))
       };
      heapable.index = heap.length;
      heap.push(heapable);
      return this._siftUp(heapable.index, heapable.parentIndex, heap);
    
   },
  _siftUp( index = this.index,parentIndex = this.parentIndex,heap = this.heap ){ 
    
      return (function() {
        var while$61 = undefined;
        while ((index !== 0 && heap[index].compareTo(heap[parentIndex]) === -1)) {
          while$61 = (function() {
            const currentNode=heap[index];
            currentNode.index = parentIndex;
            const parentNode=heap[parentIndex];
            parentNode.index = index;
            heap[index] = parentNode;
            heap[parentIndex] = currentNode;
            index = parentIndex;
            return parentIndex = heap[index].parentIndex;
          }).call(this);
        };
        return while$61;
      }).call(this);
    
   },
  _siftDown( index = this.index,leftIndex = this.leftIndex,rightIndex = this.rightIndex,heap = this.heap ){ 
    
      return (function() {
        var while$62 = undefined;
        while (((leftIndex < heap.length && heap[index].compareTo(heap[leftIndex]) === 1) || (rightIndex < heap.length && heap[index].compareTo(heap[rightIndex]) === 1))) {
          while$62 = (function() {
            const smallestChildIndex=(function() {
              if ((rightIndex >= heap.length || heap[leftIndex].compareTo(heap[rightIndex]) === -1)) {
                return leftIndex;
              } else {
                return rightIndex;
              }
            }).call(this);
            var smallestNode = heap[smallestChildIndex];
            var currentNode = heap[index];
            smallestNode.index = index;
            currentNode.index = smallestChildIndex;
            heap[index] = smallestNode;
            heap[smallestChildIndex] = currentNode;
            index = smallestChildIndex;
            leftIndex = smallestNode.leftIndex;
            return rightIndex = smallestNode.rightIndex;
          }).call(this);
        };
        return while$62;
      }).call(this);
    
   }
 });
export { 
  BinaryHeap
 };