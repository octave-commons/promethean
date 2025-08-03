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
  rendering
 } from "./rendering.js";
import { 
  particles
 } from "./data.js";
import { 
  Vector
 } from "/shared/vectors.js";
import { 
  config
 } from "./config.js";
const { 
  minMass,
  maxMass,
  actualMaximumMass,
  spawnHeight,
  spawnWidth
 }=config;
const randomSignedFloat=((range) => {
	return ((Math.random() * (range - (-1 * range))) + (-1 * range));
});
var initializeMotes = (function initializeMotes$(particles, verts) {
  /* initialize-motes eval.sibilant:18:0 */

  for (var p of particles.pos.data)
  {
  const phys=particles.phys.data[p.id];;
  verts[p.id].color.r = 255;
  verts[p.id].color.g = 10;
  verts[p.id].color.b = 10;
  verts[p.id].color.a = 255;;
  verts[p.id].size = phys.scale;
  verts[p.id].intensity = Math.sqrt(phys.mass);;
  verts[p.id].point.x = p.x;
  verts[p.id].point.y = p.y;
  verts[p.id].point.z = 1;
  }
  ;
  return null;
});
var randomlyPlaceParticles = (function randomlyPlaceParticles$(particles) {
  /* randomly-place-particles eval.sibilant:39:0 */

  const spawnPos=Vector.spawn(0, 0);
  for (var p of particles.pos.data)
  {
  const phys=particles.phys.data[p.id];;
  const vel=particles.vel.data[p.id];;
  vel.x = randomSignedFloat(1000);
  vel.y = randomSignedFloat(1000);;
  var scale = (maxMass * Math.random());;
  var mass = Math.pow(Math.max(minMass, scale), 3);;
  phys.mass = mass;
  phys.scale = scale;;
  spawnPos.addTo({ 
    x:((mass / actualMaximumMass) * randomSignedFloat(spawnWidth)),
    y:((mass / actualMaximumMass) * randomSignedFloat(spawnHeight))
   });
  p.x = spawnPos.x;;
  p.y = spawnPos.y;
  }
  ;
  particles.phys.data[0].mass = actualMaximumMass;
  particles.phys.data[0].scale = maxMass;
  return null;
});
async function draw(){

  while( true ){ 
    await (new Promise(((success, fail) => {
    	var resolve = success,
        reject = fail;
    return requestAnimationFrame((() => {
    	rendering.update();
    return resolve();
    }));
    })))
   };
  return null;

};
var setup = (function setup$(particles, systems, vertices) {
  /* setup eval.sibilant:74:0 */

  randomlyPlaceParticles(particles);
  particles.phys.step();
  particles.pos.step();
  particles.vel.step();
  particles.kdTree.constructTree(particles.pos.data);
  initializeMotes(particles, vertices);
  systems.drawer = draw();
  particles.pos.step();
  particles.phys.step();
  systems.init();
  return systems.start();
});
export { 
  setup
 };