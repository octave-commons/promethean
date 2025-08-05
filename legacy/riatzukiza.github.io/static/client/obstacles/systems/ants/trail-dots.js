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
  DotInterface,
  Dot
 } from "/shared/systems/rendering/dot.js";
import { 
  rgba
 } from "/client/obstacles/colors.js";
const baseColor=rgba(20, 20, 125, 255);
var TrailDot = DotInterface.define("TrailDot", { 
  _color:baseColor,
  changed__QUERY:true,
  get color(  ){ 
    
      return this._color;
    
   },
  set color( c ){ 
    
      this.changed__QUERY = true;
      return this._color = c;
    
   },
  _clear(  ){ 
    
      DotInterface._clear.call(this);
      return this.color = baseColor;
    
   },
  register(  ){ 
    
      DotInterface.register.call(this);
      this.vertex.color.r = baseColor.r;
      this.vertex.color.g = baseColor.g;
      this.vertex.color.b = baseColor.b;
      this.vertex.color.a = 0;
      return this.vertex.size = 1;
    
   }
 });
export { 
  TrailDot
 };
var TrailDots = Dot.define("TrailDots", { 
  maxVerts:300000,
  interface:TrailDot,
  register(  ){ 
    
      this.proto.register.call(this);
      return this.visible__QUERY = true;
    
   },
  toggleVisibility(  ){ 
    
      return (function() {
        if (this.visible__QUERY) {
          this.verts.render__QUERY = false;
          this.components.each(((c) => {
          	return c.vertex.color.a = 0;
          }));
          return this.visible__QUERY = false;
        } else {
          this.verts.render__QUERY = true;
          return this.visible__QUERY = true;
        }
      }).call(this);
    
   },
  _updateAll( args ){ 
    
      return (function() {
        if (this.visible__QUERY) {
          return this.proto._updateAll.call(this, args);
        }
      }).call(this);
    
   },
  _updateComponent( dot ){ 
    
      dot.vertex.color.a = Math.round(Math.max(0, (255 * (dot.entity.trailSegment.remainingTime / dot.entity.trailSegment.duration))));
      if( dot.changed__QUERY ){ 
        dot.vertex.color.r = dot.color.r;
        dot.vertex.color.g = dot.color.g;
        dot.vertex.color.b = dot.color.b;;
        this.changed__QUERY = false;
       };
      return null;
    
   }
 });
export { 
  TrailDots
 };