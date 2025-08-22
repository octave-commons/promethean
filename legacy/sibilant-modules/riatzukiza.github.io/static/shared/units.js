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
  EntityGroup
 } from "./ecs.js";
import { 
  Position
 } from "./systems/position.js";
import { 
  Physics
 } from "./systems/physics.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  Saveable
 } from "/shared/saveable.js";
var UnitInstance = Spawnable.define("UnitInstance", { 
  init( entity = this.entity,group = this.group ){ 
    
      this.entity = entity;this.group = group;
      return this;
    
   },
  get game(  ){ 
    
      return this.group.game;
    
   },
  get pos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  get physics(  ){ 
    
      return this.entity.physicalProperties;
    
   },
  get scale(  ){ 
    
      return this.physics.scale;
    
   },
  get mass(  ){ 
    
      return this.physics.mass;
    
   },
  register(  ){ 
    
   },
  clear(  ){ 
    
      this.unit = null;
      return this.group = null;
    
   }
 });
export { 
  UnitInstance
 };
var UnitGroup = Saveable.define("UnitGroup", { 
  docString:"Shared.Units.Unit-group",
  init( groupName = this.groupName,componentTypes = this.componentTypes ){ 
    
      this.groupName = groupName;this.componentTypes = componentTypes;
      return this;
    
   },
  baseComponents:[ Position, Physics ],
  instanceInterface:UnitInstance,
  template:true,
  get components(  ){ 
    
      return (function() {
        if (this._components) {
          return this._components;
        } else {
          return this._components = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return [ this.componentTypes, this.baseComponents ].flat();
          }).call(this);
        }
      }).call(this);
    
   },
  get group(  ){ 
    
      return (function() {
        if (this._group) {
          return this._group;
        } else {
          return this._group = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return create(EntityGroup)((this.groupName + "Unit"), this.components, this.game.ent);
          }).call(this);
        }
      }).call(this);
    
   },
  build(  ){ 
    
      return (function() {
        if (!(this.template)) {
          return this.init();
        }
      }).call(this);
    
   },
  spawn( args ){ 
    
      const entity=this.group.spawn();
      const unit=this.instanceInterface.spawn(entity, this);
      entity.unit = unit;
      for (var c of entity.components)
      {
      c.unit = unit;
      }
      ;
      unit.register(args);
      return unit;
    
   },
  despawn( unit ){ 
    
      for (var c of unit.entity.components)
      {
      c.unit = null;
      }
      ;
      this.group.despawn(unit.entity);
      return unit.despawn();
    
   }
 });
export { 
  UnitGroup
 };