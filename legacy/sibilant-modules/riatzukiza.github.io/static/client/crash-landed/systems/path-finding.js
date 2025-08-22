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
  System,
  Component
 } from "/shared/ecs.js";
import { 
  Spawnable
 } from "/shared/data-structures/spawnable.js";
import { 
  List
 } from "/shared/data-structures/list.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  config
 } from "../config.js";
import { 
  Heapable,
  BinaryHeap
 } from "/shared/data-structures/trees/binary-heap.js";
var removeFromArray = (function removeFromArray$(el, array) {
  /* remove-from-array eval.sibilant:11:0 */

  const index=array.indexOf(el);
  return (function() {
    if (index > -1) {
      return array.splice(index, 1);
    }
  }).call(this);
});
var calculateDistanceCost = (function calculateDistanceCost$(start, end) {
  /* calculate-distance-cost eval.sibilant:15:0 */

  const startV=Vector.spawn(start.x, start.y);
  const endV=Vector.spawn(end.x, end.y);
  const distance=startV.distanceTo(endV);
  const dLength=Math.round(distance.getLength());
  startV.despawn();
  endV.despawn();
  return ((function() {
    if ((end.entity.visibleStatus.explored__QUERY && end.entity.ground.stats)) {
      return (2 * (1 / end.entity.ground.stats.movementSpeed));
    } else {
      return 1;
    }
  }).call(this) * dLength);
});
const MOVE_STRAIGHT_COST=10;
const MOVE_DIAGONAL_COST=14;
var PathNode = Heapable.define("PathNode", { 
  get heap(  ){ 
    
      return this._heap.heap;
    
   },
  init( tile = this.tile,start = this.start,end = this.end,_heap = this._heap ){ 
    
      this.tile = tile;this.start = start;this.end = end;this._heap = _heap;
      (function() {
        {
          return tile === end;
        }
      }).call(this);
      this._hCost = calculateDistanceCost(tile, end);
      (function() {
        if (isNaN(this._hCost)) {
          throw (new Error("Got a non number h cost"))
        }
      }).call(this);
      return this;
    
   },
  _parent:null,
  get index(  ){ 
    
      return this._index;
    
   },
  set index( v ){ 
    
      if( isNaN(v) ){ 
        throw (new Error("assigning NaN to index"))
       };
      return this._index = v;
    
   },
  get parent(  ){ 
    
      return this._parent;
    
   },
  set parent( v ){ 
    
      (function() {
        if (this._gCost) {
          (function() {
            if (this._gCost.spawn) {
              return this._gCost.despawn();
            } else if ((this._gCost[0] && this._gCost[0].spawn)) {
              return this._gCost.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._gCost = null;
        }
      }).call(this);
      (function() {
        if (this._fCost) {
          (function() {
            if (this._fCost.spawn) {
              return this._fCost.despawn();
            } else if ((this._fCost[0] && this._fCost[0].spawn)) {
              return this._fCost.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._fCost = null;
        }
      }).call(this);
      (function() {
        if (this._parent) {
          return BinaryHeap.updateByIndex(this.index, this.heap);
        }
      }).call(this);
      return this._parent = v;
    
   },
  tile:null,
  next:null,
  get gCost(  ){ 
    
      return (function() {
        if (this._gCost) {
          return this._gCost;
        } else {
          return this._gCost = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            (function() {
              if (this.parent === this) {
                throw (new Error("TIme traveler detected, cannot be own parent."))
              }
            }).call(this);
            return (function() {
              if (this.tile === this.start) {
                return 0;
              } else if (!(this.parent)) {
                return Math.round((Number.MAX_SAFE_INTEGER / 2));
              } else {
                return (this.parent.gCost + calculateDistanceCost(this.parent.tile, this.tile));
              }
            }).call(this);
          }).call(this);
        }
      }).call(this);
    
   },
  get fCost(  ){ 
    
      return (function() {
        if (this._fCost) {
          return this._fCost;
        } else {
          return this._fCost = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.gCost + this.hCost);
          }).call(this);
        }
      }).call(this);
    
   },
  get hCost(  ){ 
    
      return this._hCost;
    
   },
  compareTo( node ){ 
    
      return (function() {
        if (this.fCost > node.fCost) {
          return 1;
        } else if (this.fCost === node.fCost) {
          return (function() {
            if (this.hCost > node.hCost) {
              return 1;
            } else {
              return -1;
            }
          }).call(this);
        } else {
          return -1;
        }
      }).call(this);
    
   },
  get pathTo(  ){ 
    
      var path = List.spawn();
      var node = this;
      return (function() {
        var while$227 = undefined;
        while (node) {
          while$227 = (function() {
            path.unshift(node);
            node = node.parent;
            return path;
          }).call(this);
        };
        return while$227;
      }).call(this);
    
   },
  clear(  ){ 
    
      (function() {
        if (this._fCost) {
          (function() {
            if (this._fCost.spawn) {
              return this._fCost.despawn();
            } else if ((this._fCost[0] && this._fCost[0].spawn)) {
              return this._fCost.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._fCost = null;
        }
      }).call(this);
      (function() {
        if (this._gCost) {
          (function() {
            if (this._gCost.spawn) {
              return this._gCost.despawn();
            } else if ((this._gCost[0] && this._gCost[0].spawn)) {
              return this._gCost.each(((el) => {
              	return el.despawn();
              }));
            }
          }).call(this);
          return this._gCost = null;
        }
      }).call(this);
      this._parent = null;
      this.tile = null;
      this.next = null;
      this.start = null;
      this.end = null;
      return this._index = null;
    
   }
 });
var CurrentPath = Component.define("CurrentPath", { 
  start:null,
  end:null,
  currentNode:null,
  get nextNode(  ){ 
    
      return this.currentNode.next;
    
   },
  nodeList:null,
  get pos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  get vel(  ){ 
    
      return this.entity.velocityInterface;
    
   },
  open:BinaryHeap.spawn(),
  closed:(new Set()),
  currentNode:null,
  activeNodes:(new Map()),
  get nextOpenNode(  ){ 
    
      return this.open.extractMin();
    
   }
 });
var PathFinding = System.define("PathFinding", { 
  Component:CurrentPath,
  tiles:null,
  findShortestPath( c ){ 
    
      c.closed.clear();
      const startingNode=(function() {
        if (c.activeNodes.has(c.start)) {
          return c.activeNodes.get(c.start);
        } else {
          var r = (function() {
            /* inc/misc.sibilant:1:1399 */
          
            return PathNode.spawn(c.start, c.start, c.end, c.open);
          }).call(this);
          c.activeNodes.set(c.start, r);
          return r;
        }
      }).call(this);
      c.open.insert(startingNode);
      return (function() {
        var while$228 = undefined;
        while (c.open.root) {
          while$228 = (function() {
            const currentNode=c.nextOpenNode;
            return (function() {
              if (currentNode.tile === c.end) {
                c.nodeList = currentNode.pathTo;
                c.currentNode = c.nodeList.head;
                return c.open.clear();
              } else {
                c.closed.add(currentNode.tile);
                for (var neighbor of currentNode.tile.edges)
                {
                if( c.closed.has(neighbor) ){ 
                  continue
                 };
                const neighborNode=(function() {
                  if (c.activeNodes.has(neighbor)) {
                    return c.activeNodes.get(neighbor);
                  } else {
                    var r = (function() {
                      /* inc/misc.sibilant:1:1399 */
                    
                      return PathNode.spawn(neighbor, c.start, c.end, c.open);
                    }).call(this);
                    c.activeNodes.set(neighbor, r);
                    return r;
                  }
                }).call(this);;
                (function() {
                  if ((currentNode.gCost + calculateDistanceCost(currentNode.tile, neighborNode.tile)) < neighborNode.gCost) {
                    neighborNode.parent = currentNode;
                    return (function() {
                      if (!(c.open.includes(neighborNode))) {
                        return c.open.insert(neighborNode);
                      }
                    }).call(this);
                  }
                }).call(this)
                }
                ;
                return null;
              }
            }).call(this);
          }).call(this);
        };
        return while$228;
      }).call(this);
    
   },
  continueToNextTile( c,pos,vel,occupiedTile ){ 
    
      const posV=Vector.spawn(pos.x, pos.y);
      const tilePosV=Vector.spawn(c.nextNode.item.tile.worldPos.x, c.nextNode.item.tile.worldPos.y);
      const d=tilePosV.distanceTo(posV);
      vel.setLength((occupiedTile.entity.ground.stats.movementSpeed * (0.1 * config.gameScale)));
      vel.setAngle(d.getAngle());
      d.despawn();
      posV.despawn();
      return tilePosV.despawn();
    
   },
  foundEnd( c,pos,vel,occupiedTile ){ 
    
      console.log("found end");
      vel.setLength(0);
      for (var [ tile, node ] of c.activeNodes)
      {
      c.activeNodes.delete(tile);
      node.despawn()
      }
      ;
      c.nodeList.despawn();
      c.currentNode = null;
      c.start = null;
      c.end = null;
      return c.nodeList = null;
    
   },
  arrivedAtNextTile( c,pos,vel,occupiedTile ){ 
    
      c.currentNode = c.nextNode;
      const posV=Vector.spawn(pos.x, pos.y);
      const tilePosV=Vector.spawn(c.nextNode.item.tile.worldPos.x, c.nextNode.item.tile.worldPos.y);
      const d=tilePosV.distanceTo(posV);
      vel.setLength((occupiedTile.entity.ground.stats.movementSpeed * (0.1 * config.gameScale)));
      vel.setAngle(d.getAngle());
      posV.despawn();
      tilePosV.despawn();
      return d.despawn();
    
   },
  traverseCurrentPath( c ){ 
    
      const pos=c.pos;
      const vel=c.vel.vector;
      const occupiedTile=this.tiles.getClosestFromWorldPos(pos.x, pos.y);
      return (function() {
        if (occupiedTile === c.currentNode.item.tile) {
          return this.continueToNextTile(c, pos, vel, occupiedTile);
        } else if ((occupiedTile === c.end || c.end !== c.currentNode.item.end)) {
          return this.foundEnd(c, pos, vel, occupiedTile);
        } else if (occupiedTile === c.nextNode.item.tile) {
          return this.arrivedAtNextTile(c, pos, vel, occupiedTile);
        }
      }).call(this);
    
   },
  _updateComponent( c ){ 
    
      if( (c.start !== null && c.end !== null && c.start === c.end) ){ 
        c.start = null;
        c.end = null;
        c.currentNode = null;
       };
      (function() {
        if (c.currentNode) {
          return this.traverseCurrentPath(c);
        }
      }).call(this);
      return (function() {
        if ((c.start && c.end && !(c.currentNode))) {
          return this.findShortestPath(c);
        }
      }).call(this);
    
   }
 });
export { 
  PathFinding
 };
export { 
  CurrentPath
 };