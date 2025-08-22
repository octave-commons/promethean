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
var { 
  SparseVectorField
 } = require("@shared/data-structures/fields/sparse.js");
var { 
  Signal,
  Influence
 } = require("@crash-landed/systems/signal.js");
var noise = require("@shared/noise.js");
var config = require("@crash-landed/config.js");
var NoiseField = SparseVectorField.define("NoiseField", { 
  angleZoom:config.angleZoom,
  noiseZ:config.noiseZ,
  force:config.fieldForce,
  _equation( x = (typeof x !== "undefined") ? x : this.x;,y = (typeof y !== "undefined") ? y : this.y;,t = (typeof t !== "undefined") ? t : this.t;,t_ = (typeof t_ !== "undefined") ? t_ : this.t_;,v = (typeof v !== "undefined") ? v : this.v;,v_ = (typeof v_ !== "undefined") ? v_ : this.v_;,angleZoom = (typeof angleZoom !== "undefined") ? angleZoom : this.angleZoom;,noiseZ = (typeof noiseZ !== "undefined") ? noiseZ : this.noiseZ;,force = (typeof force !== "undefined") ? force : this.force; ){ 
    
      v.setAngle((noise.simplex3((x / angleZoom / 5), (y / angleZoom / 5), (t * (noiseZ / 10000))) * Math.PI * 2));
      return v.setLength(((noise.simplex3(((x / 50) + 40000), ((y / 50) + 40000), (t * (noiseZ / 10000))) * force) / 20));
    
   }
 });
var Static = Influence.define("Static", { 
  
 });
var Noise = Signal.define("Noise", { 
  interface:Static,
  field:NoiseField.spawn()
 });
exports.Noise = Noise;