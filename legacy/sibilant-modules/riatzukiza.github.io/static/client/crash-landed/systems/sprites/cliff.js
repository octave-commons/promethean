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
  AnimatedSprite,
  SpriteAtlas
 } from "/shared/systems/rendering/sprite-atlas.js";
const spriteImage=document.getElementById("cliff-sprite");
var CliffSprite = AnimatedSprite.define("CliffSprite", { 
  column:15,
  row:15,
  get visible__QUERY(  ){ 
    
      return this.entity.visibleStatus.visible__QUERY;
    
   },
  get explored__QUERY(  ){ 
    
      return this.entity.visibleStatus.explored__QUERY;
    
   },
  get alpha(  ){ 
    
      return (function() {
        if (this.visible__QUERY) {
          return 1;
        } else if (this.explored__QUERY) {
          return 0.8;
        } else {
          return 0;
        }
      }).call(this);
    
   },
  selectTile( x,y ){ 
    
      (function() {
        if (x >= this.width) {
          throw (new RangeError("Column selection out of range"))
        }
      }).call(this);
      (function() {
        if (y >= this.height) {
          throw (new RangeError("Row selection out of range"))
        }
      }).call(this);
      this.column = x;
      return this.row = y;
    
   },
  step(  ){ 
    
      return this.currentFrame = ((this.currentFrame + 1) % this.system.sequenceLength);
    
   }
 });
var CliffSprites = SpriteAtlas.define("CliffSprites", { 
  Component:CliffSprite,
  frameDimensions:[ 32, 32 ],
  height:16,
  width:16,
  img:spriteImage
 });
export { 
  CliffSprites
 };