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
  startInterface
 } from "./dom.js";
import { 
  Position
 } from "/shared/systems/position.js";
import { 
  Sight
 } from "./systems/sight.js";
import { 
  getCardinalDirectionName
 } from "./directions.js";
import { 
  PathFinding
 } from "./systems/path-finding.js";
import { 
  Velocity
 } from "/shared/systems/velocity.js";
import { 
  getTileNoise
 } from "./noise.js";
import { 
  config
 } from "./config.js";
Velocity.realTime__QUERY = false;
Position.wraps__QUERY = false;
addEventListener("load", (() => {
	return startInterface();
}));