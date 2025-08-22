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
const dim=[ (0.8 * window.innerWidth), (window.innerHeight - 3) ];
const size=1;
const config={  };
config.size = size;
config.uiPollingRate = 10;
config.trailResolution = 5;
config.angleZoom = 35;
config.noiseZ = 255;
config.fieldForce = 28;
config.dimensions = dim;
config.columns = Math.ceil((dim[0] / size));
config.rows = Math.ceil((dim[1] / size));
config.decay = 1;
config.maxLength = 200;
config.trailResultDuration = 5000;
config.growthRate = 0.0005;
config.startingPlants = 1;
config.plantMassLimit = 32;
config.antLimit = 100;
config.maxInDecay = 1000;
config.trailLimit = 60000;
config.antLife = 120000;
config.decayOnCollision = true;
config.optionsAmplitude = 10;
config.limitDecay = false;
config.antInfluence = 90;
config.friction = 0.1;
config.collisionStatic = 5;
config.spawnStatic = 10;
config.spawnRate = 10;
config.homeLocation = [ 300, 200 ];
config.targetLocation = [ 700, 900 ];
config.rocks = 10;
config.rockMinSize = 16;
config.rockMaxSize = 32;
config.rockMassScalingFactor = 1;
config.rockMinMassFactor = 10;
config.rockMaxMassFactor = 100;
config.stationaryResistanceCoefficiant = 2;
config.trackTrail = true;
config.varyNoiseWithTime = true;
config.rewardWinners = true;
config.winYield = 30;
config.lossFactor = 30;
config.punishLoosers = true;
config.stepWiseUpdate = true;
config.gameSpeed = 1;
export { 
  config
 };