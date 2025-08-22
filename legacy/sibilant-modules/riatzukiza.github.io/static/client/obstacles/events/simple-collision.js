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
  Velocity
 } from "/shared/systems/velocity.js";
import { 
  Position
 } from "/shared/systems/position.js";
import { 
  game
 } from "../game.js";
import { 
  createParticleUpdater
 } from "/shared/field.js";
import { 
  plants,
  ants,
  rocks
 } from "../entities.js";
import { 
  Physics
 } from "/shared/systems/physics/system.js";
import { 
  Vector
 } from "/shared/vectors.js";
game.events.on("simpleCollision", ((c, c_) => {
	var v = c.entity.velocityInterface;
var v_ = c_.entity.velocityInterface;
var p = game.systems.get(Physics, c.entity);
var p_ = game.systems.get(Physics, c_.entity);
var m = p.mass;
var m_ = p_.mass;
const pos=v.pos;
const pos_=v_.pos;
const vector1=Vector.spawn(v.xd, v.yd);
const vector2=Vector.spawn(v_.xd, v_.yd);
const theta=Math.atan2((vector1.y - vector2.y), (vector1.x - vector2.x));
const v1=vector1.rotateTo((theta));
const v2=vector2.rotateTo((theta));
const u1=Vector.spawn((((v1.x * (m - m_)) / (m + m_)) + (v2.x * 2 * (m_ / (m + m_)))), v1.y).rotateTo(theta);
v.xd = u1.x;
v.yd = u1.y;
v1.despawn();
v2.despawn();
u1.despawn();
return null;
})).once("error", ((err) => {
	console.log("error on", "simpleCollision", "of", "game.events", "given", "c(c_)");
return console.log(err);
}));