require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@world-gen-worker/world-gen/tile-setup.js":[function(require,module,exports){
Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1123 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1185 */

  return Object.keys(this).forEach(((k) => {
  	
    return f(this[k], k);
  
  }));
});
var { 
  SuperPosition
 } = require("@crash-landed/world-gen/super-position.js"),
    { 
  TileNode
 } = require("@shared/tiles.js"),
    { 
  getTileNoise
 } = require("@crash-landed/noise.js"),
    { 
  SuperPositionDistrobution,
  ExpectedLikelyhoodGivenCurrentState,
  CurrentDistrobution
 } = require("@crash-landed/world-gen/probabilities.js"),
    { 
  ItemGroup
 } = require("@crash-landed/units.js"),
    config = require("@crash-landed/config.js");
var collapsedTiles = 0;
TileNode.collapseWaveFunction = (function TileNode$collapseWaveFunction$(depth = 0, maxDepth = 2) {
  /* Tile-node.collapse-wave-function node_modules/kit/inc/core/function-expressions.sibilant:29:8 */

  const superPosition=SuperPosition.spawn(this);
  superPosition.collapse();
  ((collapsedTiles)++);
  (function() {
    if (CurrentDistrobution.totalInstances !== collapsedTiles) {
      throw (new Error("more tiles counted in distrobution than have collapsed"))
    }
  }).call(this);
  return superPosition.despawn();
});
TileNode.setup = (function TileNode$setup$(x = this.x, y = this.y) {
  /* Tile-node.setup node_modules/kit/inc/core/function-expressions.sibilant:29:8 */

  const v=getTileNoise(x, y);
  this.collapseWaveFunction();
  (function() {
    if (((v.x + v.y) > 16 && this.entity.ground.type === "floweryGrass")) {
      const item=ItemGroup.spawn();
      item.physics.scale = config.gameScale;
      const tileContainer=this.entity.container;
      item.pos.x = this.worldPos.x;
      item.pos.y = this.worldPos.y;
      return tileContainer.add(item.entity);
    }
  }).call(this);
  const groundStats=this.entity.ground.stats;
  const x_=(Math.abs(Math.round((this.x * v.x))) % (groundStats.spriteCoordMaxX - groundStats.spriteCoordMinX));
  const y_=(Math.abs(Math.round((this.y * v.y))) % (groundStats.spriteCoordMaxY - groundStats.spriteCoordMinY));
  const coords=[ (x_ + this.entity.ground.stats.spriteCoordMinX), (y_ + this.entity.ground.stats.spriteCoordMinY) ];
  this.entity.floorSprite.selectTile(...coords);
  return v.despawn();
});
},{"@crash-landed/config.js":"@crash-landed/config.js","@crash-landed/noise.js":"@crash-landed/noise.js","@crash-landed/units.js":"@crash-landed/units.js","@crash-landed/world-gen/probabilities.js":"@crash-landed/world-gen/probabilities.js","@crash-landed/world-gen/super-position.js":"@crash-landed/world-gen/super-position.js","@shared/tiles.js":"@shared/tiles.js"}]},{},[]);
