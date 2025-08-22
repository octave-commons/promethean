require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/systems/ant-life-timer.js":[function(require,module,exports){
var { 
  Timer,
  TimeLimit
 } = require("@obstacles/systems/timer.js"),
    config = require("@obstacles/config.js");
var AntLife = TimeLimit.define("AntLife", { 
  get duration(  ){ 
    
      return config.antLife;
    
   },
  callback( e ){ 
    
      return e.despawn();
    
   }
 });
var AntLifeTimer = Timer.define("AntLifeTimer", { 
  
 });
},{"@obstacles/config.js":"@obstacles/config.js","@obstacles/systems/timer.js":"@obstacles/systems/timer.js"}]},{},[]);
