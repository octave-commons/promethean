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
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  config
 } from "../config.js";
import { 
  RedBlackTree
 } from "/shared/data-structures/trees/red-black-tree.js";
import { 
  simplex3
 } from "/shared/noise.js";
var getMoveNoise = (function getMoveNoise$(x = this.x, y = this.y, t = this.t, force = 16, v = Vector.spawn(1, 1)) {
  /* get-move-noise inc/core/function-expressions.sibilant:28:8 */

  v.setAngle((simplex3((x / config.angleZoom / 5), (y / config.angleZoom / 5), (t * (config.noiseZ / 10000))) * Math.PI * 2));
  const length=simplex3(((x / 50) + 40000), ((x / 50) + 40000), (t * (config.noiseZ / 10000)));
  v.setLength((length * force));
  return v;
});
var MindState = Component.define("MindState", { 
  get needs(  ){ 
    
      return this.entity.needs;
    
   },
  get hunger(  ){ 
    
      return this.needs.hungerEfficiencyModifier;
    
   },
  get isHungry__QUERY(  ){ 
    
      return this.needs.isHungry__QUERY;
    
   },
  get isTired__QUERY(  ){ 
    
      return this.needs.isTired__QUERY;
    
   },
  get tiredness(  ){ 
    
      return this.needs.sleepEfficiencyModifier;
    
   },
  get threat(  ){ 
    
      return 0;
    
   },
  get tile(  ){ 
    
      return this.entity.currentPath.system.tiles.getClosestFromWorldPos(this.pos.x, this.pos.y);
    
   },
  get pos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  get explorative(  ){ 
    
      return (1 / (this.hunger + this.tiredness));
    
   },
  set target( t ){ 
    
      this.entity.currentPath.start = this.tile;
      return this.entity.currentPath.end = t;
    
   },
  get target(  ){ 
    
      return this.entity.currentPath.end;
    
   },
  get visibleTiles(  ){ 
    
      return this.entity.fieldOfView.visibleTiles;
    
   },
  food:(new Set()),
  knownFoodItems:RedBlackTree.spawn()
 });
export { 
  MindState
 };
var MentalState = System.define("MentalState", { 
  Component:MindState,
  addVisibleFoodToTree( c ){ 
    
      return c.visibleTiles.each(((tile) => {
      	return (function() {
        if ((tile.entity.container.objects.head && !(c.food.has(tile.entity.container.objects.head.item.itemInterface)) && tile.entity.container.objects.head.item.itemInterface.type === "food")) {
          c.food.add(tile.entity.container.objects.head.item.itemInterface);
          return c.knownFoodItems.set(("" + tile.worldPos.x + tile.worldPos.y), tile);
        }
      }).call(this);
      }));
    
   },
  wakeupStarving( c ){ 
    
      c.needs.isResting__QUERY = false;
      return console.log("i'm starving, I have to wake up.", c);
    
   },
  handleTired( c ){ 
    
      c.needs.isResting__QUERY = true;
      c.entity.velocityInterface.vector.setLength(0);
      c.target = null;
      return console.log("I'm tired, it's time to rest", c);
    
   },
  handleFoodInSameTile( c ){ 
    
      console.log("I'm hungry, and there's food right here", c);
      return c.tile.entity.container.objects.head.item.itemInterface.consume(c.entity);
    
   },
  handleKnownFoodLocation( c,items,key ){ 
    
      console.log("I'm hungry and I know where food is");
      c.target = items.values.head.item;
      return c.knownFoodItems.remove(key, items.values.head.item);
    
   },
  handleExploreForFood( c ){ 
    
      console.log("I'm hungry and I don't know where food is.");
      return this.exploreMap(c);
    
   },
  searchForFood( c ){ 
    
      const key=("" + c.pos.x + c.pos.y);
      const items=c.knownFoodItems.search(key);
      return (function() {
        if ((!(c.target) && items.values.head)) {
          return this.handleKnownFoodLocation(c, items, key);
        } else if (!(c.target)) {
          return this.handleExploreForFood(c);
        }
      }).call(this);
    
   },
  handleHungry( c,key ){ 
    
      c.knownFoodItems = c.knownFoodItems.root;
      return (function() {
        if (c.tile.entity.container.hasType("food")) {
          return this.handleFoodInSameTile(c);
        } else if (!(c.tile.entity.container.hasType("food"))) {
          return this.searchForFood(c);
        }
      }).call(this);
    
   },
  exploreMap( c ){ 
    
      var newX = c.entity.positionInterface.x,
          newY = c.entity.positionInterface.y;
      const searchLimit=10;
      var i = 0;
      return (function() {
        var while$222 = undefined;
        while (!((c.entity.currentPath.end || i > searchLimit))) {
          while$222 = (function() {
            const noiseV=getMoveNoise(newX, newY, this.game.ticker.ticks, (1 * config.gameScale));
            ((i)++);
            newX = (newX + (20 * noiseV.x));
            newY = (newY + (20 * noiseV.y));
            const tiles=c.tile.graph;
            const possibleEnd=tiles.getClosestFromWorldPos(newX, newY);
            (function() {
              if (!((possibleEnd.entity.visibleStatus.explored__QUERY))) {
                c.entity.currentPath.start = tiles.getClosestFromWorldPos(c.entity.positionInterface.x, c.entity.positionInterface.y);
                return c.entity.currentPath.end = possibleEnd;
              }
            }).call(this);
            return noiseV.despawn();
          }).call(this);
        };
        return while$222;
      }).call(this);
    
   },
  _updateComponent( c ){ 
    
      this.addVisibleFoodToTree(c);
      return (function() {
        if ((c.isTired__QUERY && !(c.isHungry__QUERY) && !(c.needs.isResting__QUERY))) {
          return this.handleTired(c);
        } else if ((c.needs.isResting__QUERY && c.needs.isStarving__QUERY)) {
          return this.wakeupStarving(c);
        } else if ((c.isHungry__QUERY && !(c.isResting__QUERY))) {
          return this.handleHungry(c);
        } else if (!(c.needs.isResting__QUERY)) {
          return this.exploreMap(c);
        }
      }).call(this);
    
   }
 });
export { 
  MentalState
 };