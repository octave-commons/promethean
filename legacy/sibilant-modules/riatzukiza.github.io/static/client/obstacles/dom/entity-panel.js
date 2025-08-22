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
  Component
 } from "/shared/ecs.js";
import { 
  game
 } from "/client/obstacles/game.js";
import { 
  Dot
 } from "/shared/systems/rendering/dot.js";
import { 
  PooledDataStructure
 } from "/shared/data-structures/pooled.js";
import { 
  rgba
 } from "/client/obstacles/colors.js";
var EntityPanel = Interface.define("EntityPanel", { 
  init( entity = this.entity ){ 
    
      this.entity = entity;
      return this;
    
   },
  clear(  ){ 
    
      return this.entity = null;
    
   },
  spawn( entity ){ 
    
      return create(this)(entity);
    
   },
  render( _parent = this._parent,attributes = this.attributes,tagName = this.tagName,_node = this._node,children = this.children ){ 
    
      const componentPanel=((component) => {
      	return Object.keys(component).reduce(((accumulator, key) => {
      	const property=component[key];
      return (function() {
        if ((typeof property === "string" || property.render || typeof property === "number")) {
          return [ ...accumulator, createDocumentNode("div", { 'className': "panel" }, [ key, ":", component[key] ]) ];
        }
      }).call(this);
      }), []);
      });
      return createDocumentNode("div", {
        'className': "panel",
        'onmouseenter': (() => {
        	const dot=game.systems.get(Dot, this.entity);
        this.entity.originalColor = dot.color;
        dot.color = rgba(255, 255, 0, 255);
        return console.log("mouse entered", dot.color);
        }),
        'onmouseleave': (() => {
        	const dot=game.systems.get(Dot, this.entity);
        dot.color = this.entity.originalColor;
        return console.log("mouse left", dot.color);
        })
      }, [ this.entity.aspects.map(((system) => {
      	const component=game.systems.get(system, this.entity);
      return createDocumentNode("div", { 'className': "panel" }, [ createDocumentNode("div", { 'className': "panel" }, [ createDocumentNode("b", {  }, [ system.name ]) ]), (function() {
        if (this[system.name]) {
          return this[system.name](component);
        } else {
          return createDocumentNode("div", { 'className': "panel" }, [ componentPanel(component) ]);
        }
      }).call(this) ]);
      })) ]).render(_parent);
    
   }
 });
export { 
  EntityPanel
 };