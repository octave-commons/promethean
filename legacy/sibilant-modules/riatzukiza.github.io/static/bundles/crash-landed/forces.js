require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/forces.js":[function(require,module,exports){
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
  Friction
 } = require("@shared/systems/physics/forces/friction.js"),
    { 
  game
 } = require("@crash-landed/game.js"),
    config = require("@crash-landed/config.js");
var Friction = Friction.define("Friction", { 
  config:config,
  template:false,
  register(  ){ 
    
      return this.config = config;
    
   },
  reset(  ){ 
    
   }
 });
exports.Friction = Friction;
},{"@crash-landed/config.js":"@crash-landed/config.js","@crash-landed/game.js":"@crash-landed/game.js","@shared/systems/physics/forces/friction.js":"@shared/systems/physics/forces/friction.js"}]},{},[]);
