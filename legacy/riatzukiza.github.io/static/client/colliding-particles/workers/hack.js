Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1692 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1754 */

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
for (var pos of positions.data)
{
const target=particles[pos.id];;
const object=phys.data[pos.id];;
const p=Vector.spawn(pos.x, pos.y);;
const elements=quads.retrieve({ 
  x:pos.x,
  y:pos.y,
  height:(4 * object.scale),
  width:(4 * object.scale)
 }).sort(((a, b) => {
	const d1=Math.abs(p.distanceTo(a.pos));
const d2=Math.abs(p.distanceTo(b.pos));
return (function() {
  if (d1 > d2) {
    return 1;
  } else {
    return -1;
  }
}).call(this);
}));;
p.despawn()
}
;