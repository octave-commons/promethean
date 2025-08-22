Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
import { 
  ItemGroup
 } from "../units.js";
import { 
  config
 } from "../config.js";
import { 
  getTileNoise
 } from "../noise.js";
var setupTile = (function setupTile$(tileData, tiles) {
  /* setup-tile eval.sibilant:5:0 */

  const tile=tiles.get(tileData.x, tileData.y);
  tile.entity.ground.type = tileData.type;
  const v=getTileNoise(tile.x, tile.y);
  (function() {
    if (((v.x + v.y) > 16 && tile.entity.ground.type === "floweryGrass")) {
      const item=ItemGroup.spawn();
      item.physics.scale = config.gameScale;
      const tileContainer=tile.entity.container;
      item.pos.x = tile.worldPos.x;
      item.pos.y = tile.worldPos.y;
      return tileContainer.add(item.entity);
    }
  }).call(this);
  const groundStats=tile.entity.ground.stats;
  const x_=(Math.abs(Math.round((tile.x * v.x))) % (groundStats.spriteCoordMaxX - groundStats.spriteCoordMinX));
  const y_=(Math.abs(Math.round((tile.y * v.y))) % (groundStats.spriteCoordMaxY - groundStats.spriteCoordMinY));
  const coords=[ (x_ + tile.entity.ground.stats.spriteCoordMinX), (y_ + tile.entity.ground.stats.spriteCoordMinY) ];
  return tile.entity.floorSprite.selectTile(...coords);
});
export { 
  setupTile
 };