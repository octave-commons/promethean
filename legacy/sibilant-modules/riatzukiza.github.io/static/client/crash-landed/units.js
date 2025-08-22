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
  Physics
 } from "/shared/systems/physics.js";
import { 
  PlayerSprites
 } from "./systems/sprites/player.js";
import { 
  PropsSprites
 } from "./systems/sprites/basic-props.js";
import { 
  rendering
 } from "./rendering.js";
import { 
  Velocity
 } from "/shared/systems/velocity.js";
import { 
  Sight
 } from "./systems/sight.js";
import { 
  GroundTypes
 } from "./systems/floor-type.js";
import { 
  TileVisibility
 } from "./systems/visibility.js";
import { 
  PathFinding
 } from "./systems/path-finding.js";
import { 
  Metabolisim
 } from "./systems/metabolisim.js";
import { 
  Containers
 } from "./systems/containers.js";
import { 
  MentalState
 } from "./systems/mental-state.js";
import { 
  Item
 } from "./systems/item.js";
import { 
  config
 } from "./config.js";
import { 
  FloorSprites
 } from "./systems/sprites/floor.js";
import { 
  CliffSprites
 } from "./systems/sprites/cliff.js";
import { 
  UnitInstance,
  UnitGroup
 } from "/shared/units.js";
var ItemUnit = UnitInstance.define("ItemUnit", { 
  get data(  ){ 
    
      return this.entity.itemInterface;
    
   },
  get container(  ){ 
    
      return this.data.container;
    
   },
  consume( entity ){ 
    
      return this.data.consume(entity);
    
   }
 });
export { 
  ItemUnit
 };
var ItemGroup = UnitGroup.define("ItemGroup", { 
  instanceInterface:ItemUnit,
  template:false,
  groupName:"item",
  componentTypes:[ PropsSprites, Item ]
 });
export { 
  ItemGroup
 };
var PlayerUnit = UnitInstance.define("PlayerUnit", { 
  get sprite(  ){ 
    
      return this.entity.playerSprite;
    
   },
  get pathing(  ){ 
    
      return this.entityCurrentPath;
    
   },
  get mindState(  ){ 
    
      return this.entity.mindState;
    
   },
  get needs(  ){ 
    
      return this.entity.needs;
    
   },
  get los(  ){ 
    
      return this.entity.fieldOfView;
    
   },
  get velocity(  ){ 
    
      return this.entity.velocityInterface;
    
   },
  eat( item ){ 
    
      return this.needs.eat(item);
    
   }
 });
export { 
  PlayerUnit
 };
var Player = UnitGroup.define("Player", { 
  template:false,
  instanceInterface:PlayerUnit,
  groupName:"player",
  componentTypes:[ PlayerSprites, Velocity, Sight, PathFinding, Metabolisim, MentalState ]
 });
export { 
  Player
 };