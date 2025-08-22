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
  Layer
 } from "./layer.js";
import { 
  PooledSystem
 } from "../../pooling/pooled-system.js";
import { 
  System
 } from "../../ecs.js";
import { 
  Gl
 } from "../../gl.js";
import { 
  Scalar
 } from "../../math/scalar.js";
window.size = (function window$size$() {
  /* window.size eval.sibilant:2:337 */

  return [ window.innerWidth, window.innerHeight ];
});
var bound = (function() {
  /* eval.sibilant:2:420 */

  return arguments[0].bind();
}),
    clear = (function() {
  /* eval.sibilant:2:445 */

  return arguments[0].clear();
}),
    rendered = (function() {
  /* eval.sibilant:2:474 */

  return arguments[0].render();
}),
    unbound = (function() {
  /* eval.sibilant:2:504 */

  return arguments[0].unbind();
}),
    disabled = (function() {
  /* eval.sibilant:2:533 */

  return arguments[0].disable();
}),
    enabled = (function() {
  /* eval.sibilant:2:564 */

  return arguments[0].enable();
});
var allowAlphaBlending = (function allowAlphaBlending$(context) {
  /* allow-alpha-blending eval.sibilant:2:582 */

  context.gl = context.canvas.getContext("webgl2");
  context.gl.enable(context.gl.BLEND);
  context.gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  return context.gl.blendFuncSeparate(context.gl.SRC_ALPHA, context.gl.ONE_MINUS_SRC_ALPHA, context.gl.ONE, context.gl.ONE_MINUS_SRC_ALPHA);
});
var Rendering = PooledSystem.define("Rendering", { 
  init( dimensions = window.size(),blend = true,context = Gl.context(dimensions, blend),layers = [] ){ 
    
      this.dimensions = dimensions;this.blend = blend;this.context = context;this.layers = layers;
      const self=this;
      this.xOffset = 0;
      this.yOffset = 0;
      this.zoomLevel = 0.0001;
      var mouseHeld = false;
      context.canvas.onmousedown = (function context$canvas$onmousedown$(e) {
        /* context.canvas.onmousedown eval.sibilant:2:1616 */
      
        e.preventDefault();
        return mouseHeld = true;
      });
      context.canvas.onmouseup = (function context$canvas$onmouseup$(e) {
        /* context.canvas.onmouseup eval.sibilant:2:1717 */
      
        e.preventDefault();
        return mouseHeld = false;
      });
      context.canvas.onmousemove = (function context$canvas$onmousemove$(e) {
        /* context.canvas.onmousemove eval.sibilant:2:1815 */
      
        e.preventDefault();
        return (function() {
          if (mouseHeld) {
            self.xOffset = (self.xOffset + ((2 * e.movementX) / self.zoomLevel));
            return self.yOffset = (self.yOffset + ((2 * e.movementY) / self.zoomLevel));
          }
        }).call(this);
      });
      context.canvas.onwheel = (function context$canvas$onwheel$(e) {
        /* context.canvas.onwheel eval.sibilant:2:2293 */
      
        e.preventDefault();
        const oldScale=(1 / self.zoomLevel);
        return (function() {
          if (e.deltaY > 0) {
            return self.zoomLevel = Math.max((self.zoomLevel - (self.zoomLevel * 0.05)), 1e-19);
          } else {
            return self.zoomLevel = Math.min((self.zoomLevel + (self.zoomLevel * 0.05)), 10000000000000000000);
          }
        }).call(this);
      });
      if( blend ){ 
        allowAlphaBlending(context)
       };
      this.Interface.context = context;
      this.Interface.rendering = this;
      PooledSystem.init.call(this);
      return this;
    
   },
  Interface:Layer,
  set backgroundColor( { 
    r,
    g,
    b,
    a
   } ){ 
    
      return this.context.makeCurrent().clearColor(0, 0, 0, 1);
    
   },
  resize( [ width, height ] = [ this.width, this.height ],context = this.context ){ 
    
      return context.resize(width, height);
    
   },
  load( { 
    dimensions,
    blend
   } ){ 
    
      return create(Rendering)(dimensions, blend);
    
   },
  update( layers = this.layers,context = this.context,blend = this.blend ){ 
    
      "render each visible dot to the screen";
      return layers.each(rendered);
    
   }
 });
export { 
  Rendering
 };