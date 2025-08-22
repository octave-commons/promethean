require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/systems/ants/ant-trails.js":[function(require,module,exports){
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
  Component,
  System
 } = require("@shared/ecs.js"),
    { 
  Timer,
  TimeLimit
 } = require("@crash-landed/systems/timer.js"),
    config = require("@crash-landed/config.js");
var { 
  renderChildren,
  createDocumentNode,
  DocumentNode,
  DocumentBody,
  DocumentHead,
  DocumentRoot
 } = require("@shared/dom.js");
var AntTrail = Component.define("AntTrail", { 
  _clear(  ){ 
    
      return this.segments.each(((s) => {
      	
        return this.segments.delete(s);
      
      }));
    
   },
  register(  ){ 
    
      return (function() {
        if (!(this.segments)) {
          return this.segments = (new Set());
        }
      }).call(this);
    
   }
 });
exports.AntTrail = AntTrail;
var AntTrails = System.define("AntTrails", { 
  interface:AntTrail,
  get spawnAntTrailSegment(  ){ 
    
      return require("@crash-landed/entities/trail-segments.js").spawnAntTrailSegment;
    
   },
  _updateComponent( c ){ 
    
      return (function() {
        if (((c.entity.id + c.system.process.ticker.ticks) % config.trailResolution) === 0) {
          return c.segments.add(this.spawnAntTrailSegment(c.entity));
        }
      }).call(this);
    
   }
 });
exports.AntTrails = AntTrails;
},{"@crash-landed/config.js":"@crash-landed/config.js","@crash-landed/entities/trail-segments.js":"@crash-landed/entities/trail-segments.js","@crash-landed/systems/timer.js":"@crash-landed/systems/timer.js","@shared/dom.js":"@shared/dom.js","@shared/ecs.js":"@shared/ecs.js"}]},{},[]);
