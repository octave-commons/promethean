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
const spriteImage=document.getElementById("props-sprite");
var PropsSprite = AnimatedSprite.define("PropsSprite", { 
  _column:4,
  _row:3,
  get container(  ){ 
    
      return this.entity.itemInterface.container;
    
   },
  get visible__QUERY(  ){ 
    
      return this.container.visible__QUERY;
    
   },
  get explored__QUERY(  ){ 
    
      return this.container.explored__QUERY;
    
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
    
   }
 });
export { 
  PropsSprite
 };
var PropsSprites = SpriteAtlas.define("PropsSprites", { 
  maxSprites:100000,
  Component:PropsSprite,
  frameDimensions:[ 16, 16 ],
  height:12,
  width:7,
  img:spriteImage
 });
export { 
  PropsSprites
 };