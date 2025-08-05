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
 } from "/shared/data-structures/spawnable.js";
import { 
  System,
  Component
 } from "/shared/ecs.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
var GroundType = Spawnable.define("GroundType", { 
  init( spriteCoordMinX = 0,spriteCoordMinY = 0,spriteCoordMaxX = 3,spriteCoordMaxY = 3,movementSpeed = 0.75 ){ 
    
      this.spriteCoordMinX = spriteCoordMinX;this.spriteCoordMinY = spriteCoordMinY;this.spriteCoordMaxX = spriteCoordMaxX;this.spriteCoordMaxY = spriteCoordMaxY;this.movementSpeed = movementSpeed;
      return this;
    
   }
 });
var Ground = Component.define("Ground", { 
  type:null,
  get stats(  ){ 
    
      return this.system.types[this.type];
    
   }
 });
var GroundTypes = System.define("GroundTypes", { 
  Component:Ground,
  types:Interface.define("types", { 
    grass:GroundType.spawn(0, 0, 3, 3, 0.75),
    stone:GroundType.spawn(0, 3, 3, 7, 1.1),
    brokenStone:GroundType.spawn(3, 3, 7, 7, 1),
    floweryGrass:GroundType.spawn(3, 0, 7, 3, 0.7)
   }),
  _updateComponent(  ){ 
    
   }
 });
export { 
  GroundTypes
 };