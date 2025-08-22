require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@obstacles/systems/experation.js":[function(require,module,exports){
var { 
  Component,
  System
 } = require("@shared/ecs.js"),
    config = require("@obstacles/config.js");
var TimeLimit = Component.define("TimeLimit", { 
  docString:```
  Obstacles/systems/Time-limit.md

  # Obstacles.systems.Time-limit

  ## arguments

  Inherits shared.ecs.Component arguments

  ## description

  Sets somthing to happen at a given time.
  Requires a 
  \`duration\`
  and
  \`callback\````,
  register(  ){ 
    
      return this.createdAt = Date.now();
    
   },
  get duration(  ){ 
    
      throw (new Error("no duration was given to time limit component"))
    
   },
  get callback(  ){ 
    
      throw (new Error("No callback was given to time limit component"))
    
   },
  get elapsed(  ){ 
    
      return (Date.now() - this.createdAt);
    
   },
  get remainingTime(  ){ 
    
      return (this.duration - this.elapsed);
    
   },
  get expired(  ){ 
    
      return 0 > this.timeRemaining;
    
   }
 });
var Timer = System.define("Timer", { 
  docString:```
  Obstacles/systems/Timer.md

  # Obstacles.systems.Timer

  ## arguments

  Inherits from shared.ecs.ComponentSystem

  ## description

  Allows timed events to occur for entities with time limit components```,
  _updateComponent( c ){ 
    
      return (function() {
        if (c.expired) {
          c.callback(c.entity);
          return c.despawn();
        }
      }).call(this);
    
   }
 });
},{"@obstacles/config.js":"@obstacles/config.js","@shared/ecs.js":"@shared/ecs.js"}]},{},[]);
