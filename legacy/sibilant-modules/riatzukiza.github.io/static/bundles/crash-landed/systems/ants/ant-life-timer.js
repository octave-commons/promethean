require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/systems/ants/ant-life-timer.js":[function(require,module,exports){
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
  RedBlackTree
 } = require("@shared/data-structures/trees/red-black-tree.js"),
    config = require("@crash-landed/config.js");
var { 
  Timer,
  TimeLimit
 } = require("@crash-landed/systems/timer.js"),
    { 
  placeEntity
 } = require("@shared/systems/collision.js"),
    config = require("@crash-landed/config.js");
var { 
  renderChildren,
  createDocumentNode,
  DocumentNode,
  DocumentBody,
  DocumentHead,
  DocumentRoot
 } = require("@shared/dom.js");
const views=(new Map());
var AntLife = TimeLimit.define("AntLife", { 
  duration:config.antLife,
  updateView__QUERY:true,
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get view(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("view")) {
          return this.views.get("view");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", {
              'className': "panel",
              'style': { 
                width:"48%"
               }
            }, [ createDocumentNode("div", {  }, [ "life", (() => {
            	
              return this.remainingTime;
            
            }) ]), createDocumentNode("div", {  }, [ "wins", (() => {
            	
              return this.winCount;
            
            }) ]), createDocumentNode("div", {  }, [ "losses", (() => {
            	
              return this.looseCount;
            
            }) ]) ]);
          }).call(this);
          this.views.set("view", r);
          return r;
        }
      }).call(this);
    
    });
  
 },
  _clear(  ){ 
    
      TimeLimit._clear.call(this);
      this.views.delete(this.entity);
      this.winCount = 0;
      return this.looseCount = 0;
    
   },
  register(  ){ 
    
      TimeLimit.register.call(this);
      this.winCount = 0;
      return this.looseCount = 0;
    
   },
  get homePos(  ){ 
    
      return require("@crash-landed/entities.js").homePos;
    
   },
  get segGroup(  ){ 
    
      return require("@crash-landed/entities/trail-segments.js").trailSegments;
    
   },
  callback( e,c ){ 
    
      e.positionInterface.x = this.homePos.x;
      e.positionInterface.y = this.homePos.y;
      placeEntity(e, c.system.process, config);
      ((c.looseCount)++);
      e.antTrail.segments.clear();
      return c.reset(config.antLifeDuration);
    
   }
 });
exports.AntLife = AntLife;
var AntLifeTimer = Timer.define("AntLifeTimer", { 
  get defaultDuration(  ){ 
    
      return config.antLife;
    
   },
  interface:AntLife
 });
exports.AntLifeTimer = AntLifeTimer;
},{"@crash-landed/config.js":"@crash-landed/config.js","@crash-landed/entities.js":"@crash-landed/entities.js","@crash-landed/entities/trail-segments.js":"@crash-landed/entities/trail-segments.js","@crash-landed/systems/timer.js":"@crash-landed/systems/timer.js","@shared/data-structures/trees/red-black-tree.js":"@shared/data-structures/trees/red-black-tree.js","@shared/dom.js":"@shared/dom.js","@shared/ecs.js":"@shared/ecs.js","@shared/systems/collision.js":"@shared/systems/collision.js"}]},{},[]);
