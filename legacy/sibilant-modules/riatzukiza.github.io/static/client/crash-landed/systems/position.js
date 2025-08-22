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
  displayDecimal
 } = require("@crash-landed/strings.js"),
    { 
  Position,
  PositionInterface
 } = require("@shared/systems/position.js");
var { 
  renderChildren,
  createDocumentNode,
  DocumentNode,
  DocumentBody,
  DocumentHead,
  DocumentRoot
 } = require("@shared/dom.js");
const views=(new Map());
var PositionInterface = PositionInterface.define("PositionInterface", { 
  get parentView(  ){ 
    
      return this.entity.propertyView.view;
    
   },
  get updateView__QUERY(  ){ 
    
      return (function() {
        if (this.entity.velocityInterface) {
          return this.entity.velocityInterface.updateView__QUERY;
        }
      }).call(this);
    
   },
  get views(  ){ 

      return (function() {
        if (this._views) {
          return this._views;
        } else {
          return this._views = (new Map());
        }
      }).call(this);

   },
  get view(  ){ 
  
    return (() => {
    	
      return (function() {
        if (this.views.has("view")) {
          return this.views.get("view");
        } else {
          var r = (function() {
            /* eval.sibilant:13:23 */
          
            return createDocumentNode("div", {
              'className': "panel",
              'style': { 
                width:"48%"
               }
            }, [ createDocumentNode("div", {  }, [ "position" ]), createDocumentNode("div", {  }, [ (() => {
            	
              return displayDecimal(this.x, 2);
            
            }), ", ", (() => {
            	
              return displayDecimal(this.y, 2);
            
            }) ]) ]);
          }).call(this);
          this.views.set("view", r);
          return r;
        }
      }).call(this);
    
    });
  
 }
 });
var Position = Position.define("Position", { 
  interface:PositionInterface
 });
exports.Position = Position;
exports.PositionInterface = PositionInterface;