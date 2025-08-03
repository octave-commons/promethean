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
  EventEmitter
 } from "./kit/events/index.js";
import { 
  Spawnable
 } from "./data-structures/spawnable.js";
import { 
  Trie
 } from "./data-structures/trees/trie.js";
var GridView = Spawnable.define("GridView", { 
  docString:"Shared.Grid.Grid-view",
  get grid(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "grid")))
    
   },
  get init(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "init")))
    
   },
  get cells(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "cells")))
    
   },
  get gridX(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "gridX")))
    
   },
  get gridY(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "gridY")))
    
   },
  get get(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "get")))
    
   }
 });
var GridCell = Spawnable.define("GridCell", { 
  init( x = this.x,y = this.y,grid = this.grid ){ 
    
      this.x = x;this.y = y;this.grid = grid;
      return this;
    
   },
  get data(  ){ 
    
      throw (new TypeError((this.name + " expects a definition of " + "data")))
    
   },
  get north(  ){ 
    
      return this.grid.get(this.x, (this.y + 1));
    
   },
  get south(  ){ 
    
      return this.grid.get(this.x, (this.y - 1));
    
   },
  get east(  ){ 
    
      return this.grid.get((this.x + 1), this.y);
    
   },
  get west(  ){ 
    
      return this.grid.get((this.x - 1), this.y);
    
   },
  get northEast(  ){ 
    
      return this.grid.get((this.x + 1), (this.y + 1));
    
   },
  get northWest(  ){ 
    
      return this.grid.get((this.x - 1), (this.y + 1));
    
   },
  get southEast(  ){ 
    
      return this.grid.get((this.x + 1), (this.y - 1));
    
   },
  get southWest(  ){ 
    
      return this.grid.get((this.x - 1), (this.y - 1));
    
   },
  *area( n ){ 
  
    return this.grid.area(this.x, this.y, n);
  
 },
  get edges(  ){ 
    
      return (function() {
        if (this._edges) {
          return this._edges;
        } else {
          return this._edges = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return Array.from(this.area(1));
          }).call(this);
        }
      }).call(this);
    
   },
  get neighbors(  ){ 
    
      return edges.neighbors;
    
   },
  get adjacentTiles(  ){ 
    
      return edges.adjacentTiles;
    
   },
  get adjacent(  ){ 
    
      return edges.adjacent;
    
   }
 });
export { 
  GridCell
 };
var GridChunk = GridView.define("GridChunk", { 
  init( x = this.x,y = this.y,_grid = this._grid ){ 
    
      this.x = x;this.y = y;this._grid = _grid;
      return this;
    
   },
  get grid(  ){ 
    
      return this._grid;
    
   },
  get size(  ){ 
    
      return this.grid.chunkSize;
    
   },
  get chunks(  ){ 
    
      return this.grid.chunks;
    
   },
  get overlapFactor(  ){ 
    
      return this.grid.overlapFactor;
    
   },
  get north(  ){ 
    
      return this.grid.getChunk(this.x, (this.y + 1));
    
   },
  get south(  ){ 
    
      return this.grid.getChunk(this.x, (this.y - 1));
    
   },
  get east(  ){ 
    
      return this.grid.getChunk((this.x + 1), this.y);
    
   },
  get west(  ){ 
    
      return this.grid.getChunk((this.x - 1), this.y);
    
   },
  get northEast(  ){ 
    
      return this.grid.getChunk((this.x + 1), (this.y + 1));
    
   },
  get northWest(  ){ 
    
      return this.grid.getChunk((this.x - 1), (this.y + 1));
    
   },
  get southEast(  ){ 
    
      return this.grid.getChunk((this.x + 1), (this.y - 1));
    
   },
  get southWest(  ){ 
    
      return this.grid.getChunk((this.x - 1), (this.y - 1));
    
   },
  get cells(  ){ 
    
      return (function() {
        if (this._cells) {
          return this._cells;
        } else {
          return this._cells = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return Array.from(this.grid.squareArea(this.gridX, this.gridY, this.size), ((cell, i) => {
            	cell.chunk = this;
            cell.chunkIndex = undefined;
            return cell;
            }));
          }).call(this);
        }
      }).call(this);
    
   },
  get gridX(  ){ 
    
      return (function() {
        if (this._gridX) {
          return this._gridX;
        } else {
          return this._gridX = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.x * this.size * this.overlapFactor);
          }).call(this);
        }
      }).call(this);
    
   },
  get gridY(  ){ 
    
      return (function() {
        if (this._gridY) {
          return this._gridY;
        } else {
          return this._gridY = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.y * this.size * this.overlapFactor);
          }).call(this);
        }
      }).call(this);
    
   },
  get( x = this.x,y = this.y,grid = this.grid,gridX = this.gridX,gridY = this.gridY,size = this.size ){ 
    
      `
      Shared/Grid/Grid-chunk/get.md

      # Shared.Grid.Grid-chunk.get

      ## arguments

      x: signed int, y: signed int

      ## description

      Retrieves a grid cell from within the chunk.`

      ;
      return this.grid.get((gridX + (x % size)), (gridY + (y % size)));
    
   }
 });
export { 
  GridChunk
 };
var RectangularView = GridView.define("RectangularView", { 
  init( x = this.x,y = this.y,w = this.w,h = this.h,grid = this.grid ){ 
    
      this.x = x;this.y = y;this.w = w;this.h = h;this.grid = grid;
      return this;
    
   },
  get gridX(  ){ 
    
      return (function() {
        if (this._gridX) {
          return this._gridX;
        } else {
          return this._gridX = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.x * this.w * 2);
          }).call(this);
        }
      }).call(this);
    
   },
  get gridY(  ){ 
    
      return (function() {
        if (this._gridY) {
          return this._gridY;
        } else {
          return this._gridY = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return (this.y * this.h * 2);
          }).call(this);
        }
      }).call(this);
    
   },
  get cells(  ){ 
    
      return (function() {
        if (this._cells) {
          return this._cells;
        } else {
          return this._cells = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return this.grid.area(this.gridX, this.gridY, this.w, this.h);
          }).call(this);
        }
      }).call(this);
    
   }
 });
export { 
  RectangularView
 };
var Grid = Spawnable.define("Grid", { 
  Chunk:GridChunk,
  Cell:GridCell,
  init( cells = Trie.spawn(),chunks = Trie.spawn() ){ 
    
      this.cells = cells;this.chunks = chunks;
      return this;
    
   },
  chunkSize:256,
  overlapFactor:2,
  getNearestChunk( x = this.x,y = this.y,chunkSize = this.chunkSize,overlapFactor = this.overlapFactor ){ 
    
      return this.getChunk(Math.round((x / chunkSize / overlapFactor)), Math.round((y / chunkSize / overlapFactor)));
    
   },
  getNearestChunks( x = this.x,y = this.y,n = this.n,chunkSize = this.chunkSize,overlapFactor = this.overlapFactor ){ 
    
      return this.chunkSquareArea(Math.round((x / chunkSize / overlapFactor)), Math.round((y / chunkSize / overlapFactor)), n);
    
   },
  getChunk( x = this.x,y = this.y,chunkSize = this.chunkSize,overlapFactor = this.overlapFactor ){ 
    
      return (function() {
        if (this.chunks.has([ x, y ])) {
          return this.chunks.get([ x, y ]);
        } else {
          var r = (function() {
            /* inc/misc.sibilant:1:1399 */
          
            return this.Chunk.spawn(x, y, this);
          }).call(this);
          this.chunks.set([ x, y ], r);
          return r;
        }
      }).call(this);
    
   },
  *chunkArea( x_,y_,w,h ){ 
  
    for (var x = (x_ - w);x < (x_ + w);++(x))
    {
    for (var y = (y_ - h);y < (y_ + h);++(y))
    {
    yield(this.getChunk(x, y))
    }
    
    }
    ;
    return ;
  
 },
  chunkSquareArea( x_,y_,n ){ 
    
      const r=this.chunkArea(x_, y_, n, n);
      return r;
    
   },
  *area( x_,y_,w,h ){ 
  
    for (var x = (x_ - w);x < (x_ + w);++(x))
    {
    for (var y = (y_ - h);y < (y_ + h);++(y))
    {
    yield(this.get(x, y))
    }
    
    }
    ;
    return ;
  
 },
  squareArea( x_,y_,n ){ 
    
      return this.area(x_, y_, n, n);
    
   },
  get( x,y ){ 
    
      return (function() {
        if (this.cells.has([ x, y ])) {
          return this.cells.get([ x, y ]);
        } else {
          var r = (function() {
            /* inc/misc.sibilant:1:1399 */
          
            return (function() {
              if (this.cells.has([ x, y ])) {
                return this.cells.get([ x, y ]);
              } else {
                const tile=this.Cell.spawn(x, y, this);
                this.cells.set([ x, y ], tile);
                return tile;
              }
            }).call(this);
          }).call(this);
          this.cells.set([ x, y ], r);
          return r;
        }
      }).call(this);
    
   }
 });
export { 
  Grid
 };