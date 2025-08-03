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
var ItemInterface = Component.define("ItemInterface", { 
  type:"food",
  calories:500,
  container:null,
  store( container ){ 
    
      (function() {
        if (this.container) {
          throw (new Error("An item must first be removed from its container to store it in another."))
        }
      }).call(this);
      return (function() {
        if (container.entity.container.add(this.entity)) {
          return this.container = container;
        } else {
          return false;
        }
      }).call(this);
    
   },
  consume( entity ){ 
    
      return entity.needs.eat(this);
    
   },
  clear(  ){ 
    
      return (function() {
        if (this.container) {
          this.container.remove(this.entity);
          return this.container = null;
        }
      }).call(this);
    
   }
 });
export { 
  ItemInterface
 };
var Item = System.define("Item", { 
  Component:ItemInterface,
  _updateComponent(  ){ 
    
   }
 });
export { 
  Item
 };