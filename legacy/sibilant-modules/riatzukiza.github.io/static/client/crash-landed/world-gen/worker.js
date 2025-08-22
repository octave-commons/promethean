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
  Thread,
  InlineThread
 } from "/shared/worker.js";
var TileGenerator = Thread.define("TileGenerator", { 
  url:"/client/crash-landed/world-gen/worker-index.js",
  load( saveName ){ 
    
      return this.send({ 
        type:"load",
        saveName
       });
    
   },
  save( saveName ){ 
    
      return this.send({ 
        type:"save",
        saveName
       });
    
   },
  getTile( x,y ){ 
    
      return this.send({ 
        type:"tile",
        x,
        y
       });
    
   },
  getTiles( tiles ){ 
    
      return this.send({ 
        type:"tiles",
        tiles
       });
    
   },
  getLoadedTiles( playerTile ){ 
    
      console.log(playerTile);
      return this.send({ 
        type:"getLoadedTiles",
        x:playerTile.x,
        y:playerTile.y
       });
    
   },
  getStartingTiles( x,y,n ){ 
    
      return this.send({ 
        type:"getStartingTiles",
        x,
        y,
        n
       });
    
   },
  getNear( x = this.x,y = this.y,n = 3 ){ 
    
      return this.send({ 
        type:"chunksNear",
        x,
        y,
        n
       });
    
   }
 });
export { 
  TileGenerator
 };