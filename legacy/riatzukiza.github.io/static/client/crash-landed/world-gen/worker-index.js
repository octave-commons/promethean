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
self.somthingGlobal = "hi";
console.log("YO!");
console.log(somthingGlobal);
console.log(require);
import { 
  tileGrid
 } from "/client/crash-landed/world-gen/events.js";
addEventListener("message", ((m) => {
	console.log("got somthin");
return tileGrid.events.emit(m.data.type, m.data);
}));