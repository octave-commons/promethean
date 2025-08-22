require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/world-gen/generator.js":[function(require,module,exports){
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
var TileNode = Spawnable.define("TileNode", { 
  init( x = this.x,y = this.y,graph = this.graph ){ 
    
      this.x = x;this.y = y;this.graph = graph;
      return this;
    
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
  get threadSafe(  ){ 
    
      return this.graph.getThreadSafeTile(this.x, this.y);
    
   },
  traverseArea( f = this.f,n = this.n,visited = this.visited,d = 0 ){ 
    
      f(this, d, n, visited);
      visited.add(this);
      if( n > 0 ){ 
        for (var neighbor of this.edges)
        {
        (function() {
          if (!(visited.has(neighbor))) {
            return neighbor.traverseArea(f, (n - 1), (d + 1), visited);
          }
        }).call(this)
        }
        
       };
      return this;
    
   }
 });
exports.TileNode = TileNode;
var TileLoader = Interface.define("TileLoader", { 
  init( tiles = Trie.spawn(),visited = (new Set()),events = create(EventEmitter)() ){ 
    
      this.tiles = tiles;this.visited = visited;this.events = events;
      return this;
    
   },
  getThreadSafeTile( x = this.x,y = this.y,depth = 0,maxDepth = 4 ){ 
    
      return (function() {
        if (depth <= maxDepth) {
          const tile=this.get(x, y);
          return { 
            x,
            y,
            type:tile.type,
            north:this.getThreadSafeTile(x, (y + 1), (depth + 1), maxDepth),
            south:this.getThreadSafeTile(x, (y - 1), (depth + 1), maxDepth),
            east:this.getThreadSafeTile((x + 1), y, (depth + 1), maxDepth),
            west:this.getThreadSafeTile((x - 1), y, (depth + 1), maxDepth),
            northEast:this.getThreadSafeTile((x + 1), (y + 1), (depth + 1), maxDepth),
            northWest:this.getThreadSafeTile((x - 1), (y + 1), (depth + 1), maxDepth),
            southEast:this.getThreadSafeTile((x + 1), (y - 1), (depth + 1), maxDepth),
            southWest:this.getThreadSafeTile((x - 1), (y - 1), (depth + 1), maxDepth)
           };
        }
      }).call(this);
    
   },
  get( x,y ){ 
    
      return (function() {
        if (this.tiles.has([ x, y ])) {
          return this.tiles.get([ x, y ]);
        } else {
          const tile=TileNode.spawn(x, y, this);
          const s=SuperPosition.spawn(tile);
          s.collapse();
          s.despawn();
          return this.trie.set([ x, y ], tile);
        }
      }).call(this);
    
   }
 });
exports.TileLoader = TileLoader;
},{}]},{},[]);
