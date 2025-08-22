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
  Interface
 } from "../interface/index.js";
import { 
  Actor
 } from "../actor/index.js";
import { 
  emit
 } from "../events/index.js";
var curry = R.curry;
var Layer = Actor.define("Layer", { 
  init( types = (typeof types !== "undefined") ? types : this.types;,members = (typeof members !== "undefined") ? members : types.map(((t) => {
  	return create(t)();
  })); ){ 
    
      this.types = types;this.members = members;
      t(i).forEach((function(types) {
        /* eval.sibilant:21:8 */
      
        return this[t.symbol] = members[i];
      }));
      Actor.init.call(this);
      return this;
    
   },
  get assignHandlers(  ){ 
    
      return ((a, i) => {
      	var members = this.members;
      return bubble(a.on("message", R.pipe(sendTo(this.members[(i + 1)]))), this, "error");
      });
    
   },
  _send( d = (typeof d !== "undefined") ? d : this.d;,members = (typeof members !== "undefined") ? members : this.members; ){ 
    
      return members[0].send(d);
    
   },
  start( members = (typeof members !== "undefined") ? members : this.members; ){ 
    
      return (function() {
        /* headers/repl.sibilant:3:27 */
      
        var last = members.slice(-1)[0],
            inner = members.slice(0, -1);
        inner.forEach(this.assignHandlers);
        bubble(last, this, "message");
        return this;
      }).call(this);
    
   },
  of( types ){ 
    
      return extend(this, { 
        types
       });
    
   }
 });
exports.Layer = Layer;