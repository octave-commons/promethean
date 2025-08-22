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
 } from "./data-structures/spawnable.js";
import { 
  Trie
 } from "./data-structures/trees/trie.js";
import { 
  EntityGroup
 } from "./ecs.js";
import { 
  Position
 } from "./systems/position.js";
import { 
  Physics
 } from "./systems/physics.js";
var TileNode = Spawnable.define("TileNode", { 
  init( _x = this._x,_y = this._y,entity = this.entity,graph = this.graph ){ 
    
      this._x = _x;this._y = _y;this.entity = entity;this.graph = graph;
      entity.positionInterface.x = (this.graph.tileSize * _x);
      entity.positionInterface.y = (this.graph.tileSize * _y);
      return this;
    
   },
  setup(  ){ 
    
      throw (new Error("No tile setup function defined"))
    
   },
  get worldPos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  get x(  ){ 
    
      return this._x;
    
   },
  get y(  ){ 
    
      return this._y;
    
   },
  get worldX(  ){ 
    
      return this.pos.x;
    
   },
  get worldY(  ){ 
    
      return this.pos.y;
    
   },
  get tileSize(  ){ 
    
      return this.graph.tileSize;
    
   },
  get north(  ){ 
    
      return this.graph.get(this.x, (this.y + 1));
    
   },
  get south(  ){ 
    
      return this.graph.get(this.x, (this.y - 1));
    
   },
  get east(  ){ 
    
      return this.graph.get((this.x + 1), this.y);
    
   },
  get west(  ){ 
    
      return this.graph.get((this.x - 1), this.y);
    
   },
  get northEast(  ){ 
    
      return this.graph.get((this.x + 1), (this.y + 1));
    
   },
  get northWest(  ){ 
    
      return this.graph.get((this.x - 1), (this.y + 1));
    
   },
  get southEast(  ){ 
    
      return this.graph.get((this.x + 1), (this.y - 1));
    
   },
  get southWest(  ){ 
    
      return this.graph.get((this.x - 1), (this.y - 1));
    
   },
  get edges(  ){ 
    
      return [ this.north, this.south, this.east, this.west, this.northEast, this.northWest, this.southEast, this.southWest ];
    
   },
  traverseArea( f = this.f,n = this.n,visited = (new Set()) ){ 
    
      for (var x = (this.x - n);x <= (this.x + n);++(x))
      {
      for (var y = (this.y - n);y <= (this.y + n);++(y))
      {
      const tile=this.graph.get(x, y);;
      f(tile, x, y)
      }
      
      }
      ;
      return this;
    
   }
 });
export { 
  TileNode
 };
var TileGraph = Spawnable.define("TileGraph", { 
  init( tileSize = 30,tileProperties = [],game = this.game,trie = Trie.spawn(),tileEntities = create(EntityGroup)("tiles", [ Position, Physics ].concat(tileProperties), game.ent) ){ 
    
      this.tileSize = tileSize;this.tileProperties = tileProperties;this.game = game;this.trie = trie;this.tileEntities = tileEntities;
      return this;
    
   },
  getClosestFromWorldPos( x,y ){ 
    
      return this.get(Math.round((x / this.tileSize)), Math.round((y / this.tileSize)));
    
   },
  get( x,y ){ 
    
      return (function() {
        if (this.trie.has([ x, y ])) {
          return this.trie.get([ x, y ]);
        } else {
          const entity=this.tileEntities.spawn();
          entity.physicalProperties.scale = (this.tileSize - 2);
          const tile=TileNode.spawn(x, y, entity, this);
          return this.trie.set([ x, y ], tile);
        }
      }).call(this);
    
   }
 });
export { 
  TileGraph
 };