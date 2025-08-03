require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/settings.js":[function(require,module,exports){
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
var config = require("@crash-landed/config.js"),
    entities = require("@crash-landed/entities.js");
var settings = QuickSettings.create(800, 0, "settings 1");
settings.addRange("Options amplitude", 1, 100, config.optionsAmplitude, 0.01, ((val) => {
	
  return config.optionsAmplitude = val;

}));
settings.addRange("Angle Zoom", 1, 99, config.angleZoom, 1, ((val) => {
	
  return config.angleZoom = (val / config.optionsAmplitude);

}));
settings.addRange("Noise Z", 1, 99, config.noiseZ, 1, ((val) => {
	
  return config.noiseZ = (val / config.optionsAmplitude);

}));
settings.addRange("Noise Force", 1, 99, config.fieldForce, 0.1, ((val) => {
	
  return config.fieldForce = (val / config.optionsAmplitude);

}));
settings.addRange("Signal Decay", 0, 20, config.decay, 0.01, ((val) => {
	
  return config.decay = (val / config.optionsAmplitude);

}));
settings.addRange("Max P Vector Length", 0, 999, config.maxLength, 0.1, ((val) => {
	
  return config.maxLength = (val / config.optionsAmplitude);

}));
settings.addRange("Max Trail", 10, 9999, config.maxTrail, 1, ((val) => {
	
  return config.maxTrail = val;

}));
settings.addRange("Min Trail", 10, 99, config.minTrail, 1, ((val) => {
	
  return config.minTrail = val;

}));
settings.addBoolean("Decay on collision", config.decayOnCollision, ((val) => {
	
  return config.decayOnCollision = val;

}));
settings.addBoolean("Limit the number of decay blocks per cycle", config.limitDecay, ((val) => {
	
  return config.limitDecay = val;

}));
settings.addRange("Ant Influence", 0, 99, config.antInfluence, 1, ((val) => {
	
  return config.antInfluence = val;

}));
settings.addRange("friction", 1, 10, config.friction, 1, ((val) => {
	
  return config.friction = val;

}));
settings.addRange("Collision Static", 0, 99, config.collisionStatic, 1, ((val) => {
	
  return config.collisionStatic = val;

}));
settings.addRange("Spawn Static", 0, 99, config.spawnStatic, 1, ((val) => {
	
  return config.spawnStatic = val;

}));
settings.addRange("Spawn Rate", 1, 10, config.spawnRate, 1, ((val) => {
	
  return config.spawnRate = val;

}));
settings.addRange("Game speed", 0.1, 5, config.gameSpeed, 0.1, ((val) => {
	
  return config.gameSpeed = val;

}));
settings.addButton("Clear ants", entities.clearAnts);
module.exports = settings;
},{"@crash-landed/config.js":"@crash-landed/config.js","@crash-landed/entities.js":"@crash-landed/entities.js"}]},{},[]);
