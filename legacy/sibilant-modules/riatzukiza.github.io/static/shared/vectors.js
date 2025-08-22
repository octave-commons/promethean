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
  List
 } from "./data-structures/list.js";
import { 
  PooledDataStructure
 } from "./data-structures/pooled.js";
import { 
  DynamicPool
 } from "./pooling/dynamic-pool.js";
import { 
  Spawnable
 } from "./data-structures/spawnable.js";
var Vector = Spawnable.define("Vector", { 
  init( _x = 0,_y = 0 ){ 
    
      this._x = _x;this._y = _y;
      (function() {
        if ((isNaN(_x) || isNaN(_y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
      return this;
    
   },
  get x(  ){ 
    
      return this._x;
    
   },
  get y(  ){ 
    
      return this._y;
    
   },
  set x( x ){ 
    
      (function() {
        if (isNaN(x)) {
          throw (new Error("Setting vector x to nan"))
        }
      }).call(this);
      return this._x = x;
    
   },
  set y( y ){ 
    
      (function() {
        if (isNaN(y)) {
          throw (new Error("Setting vector y to nan"))
        }
      }).call(this);
      return this._y = y;
    
   },
  add( v ){ 
    
      return Vector.spawn((this.x + v.x), (this.y + v.y));
    
   },
  addTo( v ){ 
    
      this.x += v.x;
      this.y += v.y;
      (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
      return this;
    
   },
  sub( v ){ 
    
      return Vector.spawn((this.x - v.x), (this.y - v.y));
    
   },
  subFrom( v ){ 
    
      this.x = (this.x - v.x);
      return this.y = (this.y - v.y);
    
   },
  mult( n ){ 
    
      return Vector.spawn((this.x * n), (this.y * n));
    
   },
  multTo( n ){ 
    
      this.x = (this.x * n);
      this.y = (this.y * n);
      return this;
    
   },
  div( n ){ 
    
      return Vector.spawn((this.x / n), (this.y / n));
    
   },
  divTo( n ){ 
    
      this.x = (this.x / n);
      this.y = (this.y / n);
      (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
      return this;
    
   },
  setAngle( angle ){ 
    
      const length=this.getLength();
      this.x = (Math.cos(angle) * length);
      this.y = (Math.sin(angle) * length);
      return (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
    
   },
  setLength( length ){ 
    
      const angle=this.getAngle();
      this.x = (Math.cos(angle) * length);
      this.y = (Math.sin(angle) * length);
      (function() {
        if ((isNaN(this.x) || isNaN(this.y))) {
          throw (new Error("Vector parameter is NaN"))
        }
      }).call(this);
      return this;
    
   },
  getAngle(  ){ 
    
      return Math.atan2(this.y, this.x);
    
   },
  getLength(  ){ 
    
      return Math.hypot(this.x, this.y);
    
   },
  getLengthSq(  ){ 
    
   },
  distanceTo( v ){ 
    
      return this.sub(v);
    
   },
  distanceToSq( v ){ 
    
   },
  manhattanDistanceTo(  ){ 
    
   },
  copy(  ){ 
    
   },
  rotate( angle ){ 
    
      return Vector.spawn(((this.x * Math.cos(angle)) - (this.y * Math.sin(angle))), ((this.x * Math.sin(angle)) - (this.y * Math.cos(angle))));
    
   },
  rotateTo( angle ){ 
    
      const x=((this.x * Math.cos(angle)) - (this.y * Math.sin(angle)));
      const y=((this.x * Math.sin(angle)) - (this.y * Math.cos(angle)));
      this.x = x;
      this.y = y;
      return this;
    
   },
  rotateAround( v,angle ){ 
    
   },
  rotateMeAround( v,angle ){ 
    
   },
  equals( v ){ 
    
   },
  clear(  ){ 
    
      this.x = 0;
      return this.y = 0;
    
   }
 });
export { 
  Vector
 };
var TrailVector = Spawnable.define("TrailVector", { 
  init( x = this.x,y = this.y,pheremones = this.pheremones ){ 
    
      this.x = x;this.y = y;this.pheremones = pheremones;
      return this;
    
   },
  clear(  ){ 
    
      this.x = null;
      this.y = null;
      return this.pheremones = null;
    
   }
 });
export { 
  TrailVector
 };
const vectorPool=create(DynamicPool)(Vector);
const trailPool=create(DynamicPool)(TrailVector);
export { 
  vectorPool
 };
export { 
  trailPool
 };