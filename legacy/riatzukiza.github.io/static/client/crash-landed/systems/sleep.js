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
var Wakefulness = Component.define("Wakefulness", { 
  get wellRested(  ){ 
    
      return (function() {
        {
          return this.rest > 100;
        }
      }).call(this);
    
   },
  maxRest:110,
  rest:0
 });
var Sleep = System.define("Sleep", { 
  _updateComponent( c ){ 
    
   }
 });