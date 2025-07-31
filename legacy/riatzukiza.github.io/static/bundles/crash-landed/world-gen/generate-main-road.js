require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@crash-landed/world-gen/generate-main-road.js":[function(require,module,exports){
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
var generateMainRoad = (function generateMainRoad$() {
  /* generate-main-road eval.sibilant:1:206 */

  var tile = tiles.get(0, 0);
  var i = 0;
  console.log(tile.entity.ground.type);
  return (function() {
    var while$171 = undefined;
    while ((i < 256 && tile.entity.ground.type !== "stone")) {
      while$171 = (function() {
        ((i)++);
        tile.entity.ground.type = "stone";
        const v=getTileNoise(tile.x, tile.y);
        const direction=getCardinalDirectionName(v);
        console.log(v, direction, tile, tile.entity, tile.entity.ground, tile.entity.ground.type);
        tile = tile[direction];
        return v.despawn();
      }).call(this);
    };
    return while$171;
  }).call(this);
});
exports.generateMainRoad = generateMainRoad;
},{}]},{},[]);
