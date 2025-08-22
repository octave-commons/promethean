require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@obstacles/systems/ant-dot.js":[function(require,module,exports){
var { 
  DotInterface,
  Dot
 } = require("@shared/systems/rendering/dot.js"),
    { 
  rgba
 } = require("@obstacles/colors.js");
const views=(new Map());
var AntDot = DotInterface.define("AntDot", { 
  docString:```
  Obstacles/systems/Ant-dot.md

  # Obstacles.systems.Ant-dot

  ## arguments

  entity system

  ## description

  A component for rendering ants as red dots.
  Inhereits from Dot-interface (@shared/systems/rendering/dot.js)```,
  color:rgba(255, 0, 0, 255)
 });
exports.AntDot = AntDot;
var AntDots = Dot.define("AntDots", { 
  interface:AntDot,
  docString:```
  Obstacles/systems/Ant-dots.md

  # Obstacles.systems.Ant-dots

  ## arguments

  entity system

  ## description

  A component for rendering ants as red dots```
 });
exports.AntDots = AntDots;
},{"@obstacles/colors.js":"@obstacles/colors.js","@shared/systems/rendering/dot.js":"@shared/systems/rendering/dot.js"}]},{},[]);
