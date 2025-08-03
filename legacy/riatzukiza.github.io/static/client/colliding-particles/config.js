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
const maxMass=(8 * 8 * 8 * 8 * 16 * 1024);
const spawnArea=(8 * maxMass);
const groupCount=256;
const attractorThreadCount=8;
const groupsPerThread=(groupCount / attractorThreadCount);
const collisionGroupCount=8;
const particleCount=(2 * 1024);
const minMass=16;
const actualMinMass=Math.pow(minMass, 3);
const groupSize=(particleCount / groupCount);
const collisionGroupSize=(particleCount / collisionGroupCount);
const maxCollisions=(particleCount * 8 * 8 * 16);
var config = Interface.define("config", { 
  spawnArea:spawnArea,
  spawnWidth:spawnArea,
  spawnHeight:spawnArea,
  particleCount:particleCount,
  groupSize:groupSize,
  groupCount:groupCount,
  attractorThreadCount:attractorThreadCount,
  groupsPerThread:groupsPerThread,
  groupCount:groupCount,
  collisionGroupCount:collisionGroupCount,
  collisionGroupSize:collisionGroupSize,
  maxMass:maxMass,
  minMass:minMass,
  gravitationalConstant:3.711365152319191e-37,
  minDist:minMass,
  maxCollisions:maxCollisions,
  maxObjects:(particleCount / minMass),
  maxLevels:minMass,
  particleRenderSize:512,
  actualMaximumMass:Math.pow(maxMass, 3),
  actualMinMass:actualMinMass,
  get dimensions(  ){ 
    
      return (function() {
        if (this._dimensions) {
          return this._dimensions;
        } else {
          return this._dimensions = (function() {
            /* inc/misc.sibilant:1:4125 */
          
            return [ Math.round((0.8 * window.innerWidth)), Math.round((window.innerHeight - 3)) ];
          }).call(this);
        }
      }).call(this);
    
   }
 });
export { 
  config
 };