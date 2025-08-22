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
  Friction
 } from "/shared/systems/physics/forces/friction.js";
import { 
  game
 } from "./game.js";
import { 
  config
 } from "./config.js";
import { 
  entities
 } from "/client/obstacles/entities.js";
console.log("initializing forces", { 
  Friction
 });
Fricion.config = config;
Fricion.template = false;
Friction.register = (function Friction$register$() {
  /* Friction.register eval.sibilant:10:0 */

  return this.config = config;
});
Friction.reset = (function Friction$reset$() {
  /* Friction.reset eval.sibilant:11:0 */

  
});
export { 
  Friction
 };