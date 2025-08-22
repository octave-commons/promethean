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
  List
 } from "/shared/data-structures/list.js";
var VisibleStatus = Component.define("VisibleStatus", { 
  _visible__QUERY:false,
  _explored__QUERY:false,
  get visible__QUERY(  ){ 
    
      return this._visible__QUERY;
    
   },
  get explored__QUERY(  ){ 
    
      return this._explored__QUERY;
    
   },
  set visible__QUERY( v ){ 
    
      this._visible__QUERY = v;
      this.sprite.redraw();
      return this.entity.container.objects.each(((o) => {
      	return o.entity.components.each(((c) => {
      	return (function() {
        if (c.redraw) {
          return c.redraw();
        }
      }).call(this);
      }));
      }));
    
   },
  set explored__QUERY( e ){ 
    
      this._explored__QUERY = e;
      this.sprite.redraw();
      return this.entity.container.objects.each(((o) => {
      	return o.entity.components.each(((c) => {
      	return (function() {
        if (c.redraw) {
          return c.redraw();
        }
      }).call(this);
      }));
      }));
    
   },
  get sprite(  ){ 
    
      return this.entity.floorSprite;
    
   }
 });
var TileVisibility = System.define("TileVisibility", { 
  Component:VisibleStatus,
  _updateAll(  ){ 
    
   },
  _updateComponent( c ){ 
    
   }
 });
export { 
  TileVisibility
 };