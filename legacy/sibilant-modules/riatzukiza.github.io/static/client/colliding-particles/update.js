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
  GroupingSystem,
  ElasticDeflectionSystem
 } from "./workers.js";
import { 
  config
 } from "./config.js";
var getBounds = (function getBounds$(positions) {
  /* get-bounds eval.sibilant:4:0 */

  var minX = 0,
      minY = 0,
      maxX = 0,
      maxY = 0;
  for (var p of positions.data)
  {
  (function() {
    if (p.x < minX) {
      return minX = p.x;
    }
  }).call(this);
  (function() {
    if (p.y < minY) {
      return minY = p.y;
    }
  }).call(this);
  (function() {
    if (p.x > maxX) {
      return maxX = p.x;
    }
  }).call(this);
  (function() {
    if (p.y > maxY) {
      return maxY = p.y;
    }
  }).call(this)
  }
  ;
  return [ minX, minY, maxX, maxY ];
});
async function update(systems,particles,vertices){

  systems.step();
  const bounds=getBounds(particles.pos);
  GroupingSystem.args = { 
    bounds
   };
  ElasticDeflectionSystem.args = { 
    bounds
   };
  await systems.update();
  for (var p of particles.pos.data)
  {
  const v=particles.vel.data[p.id];;
  const phys=particles.phys.data[p.id];;
  vertices[p.id].color.r = Math.min(255, (75 + (255 * (1 - (phys.mass / config.actualMaximumMass)))));
  vertices[p.id].color.b = Math.min(255, (50 + Math.abs(Math.round((2 * v.x)))));
  vertices[p.id].color.g = Math.min(255, (50 + Math.abs(Math.round((2 * v.y)))));;
  vertices[p.id].point.x = p.x;
  vertices[p.id].point.y = p.y;;
  vertices[p.id].intensity = Math.sqrt(phys.mass);
  vertices[p.id].size = phys.scale;
  }
  ;
  return null;

};
export { 
  update
 };