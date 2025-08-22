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
var TimeOfDay = Component.define("TimeOfDay", { 
  
 });
var DayNight = System.define("DayNight", { 
  dayLength:(60 * 60 * 20),
  currentTime:0
 });