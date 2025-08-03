require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/entities/home.js":[function(require,module,exports){
Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1121 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1183 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
var { 
  Dot
 } = require("@shared/systems/rendering/dot.js"),
    { 
  Position
 } = require("@crash-landed/systems/position.js"),
    { 
  Velocity
 } = require("@crash-landed/systems/velocity.js"),
    { 
  Physics
 } = require("@shared/systems/physics/index.js"),
    { 
  Collision
 } = require("@shared/systems/collision.js"),
    { 
  game,
  activeGameSystems
 } = require("@crash-landed/game.js"),
    config = require("@crash-landed/config.js"),
    { 
  rgba
 } = require("@crash-landed/colors.js");
var entity = (function entity$(aspects) {
  /* entity eval.sibilant:10:0 */

  return game.ent.spawn(aspects);
});
var home = entity([ Dot, Position, Physics, Collision ]);
var homePos = game.systems.get(Position, home);
game.systems.get(Dot, home).color = rgba(0, 255, 0, 255);
game.systems.get(Position, home).x = config.homeLocation[0];
game.systems.get(Position, home).y = config.homeLocation[1];
game.systems.get(Position, home).z = 1;
game.systems.get(Physics, home).scale = 5;
game.systems.get(Physics, home).mass = 1;
game.systems.get(Physics, home).forces = [];
game.systems.get(Collision, home).name = "home";
home.name = "home";
exports.home = home;
exports.homePos = homePos;
var { 
  Friction,
  SignalField
 } = require("@crash-landed/forces.js");
},{"@crash-landed/colors.js":"@crash-landed/colors.js","@crash-landed/config.js":"@crash-landed/config.js","@crash-landed/forces.js":"@crash-landed/forces.js","@crash-landed/game.js":"@crash-landed/game.js","@crash-landed/systems/position.js":"@crash-landed/systems/position.js","@crash-landed/systems/velocity.js":"@crash-landed/systems/velocity.js","@shared/systems/collision.js":"@shared/systems/collision.js","@shared/systems/physics/index.js":"@shared/systems/physics/index.js","@shared/systems/rendering/dot.js":"@shared/systems/rendering/dot.js"}]},{},[]);
