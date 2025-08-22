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
  Interface
 } from "/shared/kit/interface/index.js";
var TerrainModule = Interface.define("TerrainModule", { 
  directions:[ [ "northWest", 0 ], [ "north", 1 ], [ "northEast", 2 ], [ "west", 3 ], [ "center", 4 ], [ "east", 5 ], [ "southWest", 6 ], [ "south", 7 ], [ "southEast", 8 ] ],
  modules:[],
  get chunks(  ){ 
    
      return this.modules;
    
   },
  weight:1,
  indexes:Interface.define("indexes", { 
    northWest:0,
    north:1,
    northEast:2,
    west:3,
    center:4,
    east:5,
    southWest:6,
    south:7,
    southEast:8
   }),
  init( data = [],weight = 1 ){ 
    
      this.data = data;this.weight = weight;
      this.chunks.push(this);
      return this;
    
   },
  create( weight,...data ){ 
    
      return create(TerrainModule)(data, weight);
    
   },
  get( direction ){ 
    
      return this.data[this.indexes[direction]];
    
   },
  each( f = this.f,data = this.data,directions = this.directions ){ 
    
      return directions.each(((dir, i) => {
      	return f(data[dir[1]], dir[0], i);
      }));
    
   },
  reduce( f = this.f,initialValue = this.initialValue,data = this.data,directions = this.directions ){ 
    
      return directions.reduce(((acc, dir, i) => {
      	return f(acc, data[dir[1]], dir[0], i);
      }), initialValue);
    
   },
  every( f = this.f,data = this.data,directions = this.directions ){ 
    
      return directions.every(((dir, i) => {
      	return f(data[dir[1]], dir[0], i);
      }));
    
   }
 });
export { 
  TerrainModule
 };