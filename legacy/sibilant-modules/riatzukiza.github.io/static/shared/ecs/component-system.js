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
var R = require("ramda");
import { 
  OrderedMap
 } from "../data-structures/maps/ordered.js";
import { 
  DynamicPool
 } from "../pooling/dynamic-pool.js";
import { 
  Group
 } from "../data-structures/group.js";
import { 
  Component
 } from "./component.js";
import { 
  Interface
 } from "../kit/interface/index.js";
import { 
  Saveable
 } from "/shared/saveable.js";
var spawnComponent = (function spawnComponent$(entity, systems) {
  /* spawn-component eval.sibilant:16:0 */

  return (function() {
    /* eval.sibilant:16:39 */
  
    return systems.get(arguments[0]).spawn(entity);
  });
});
var componentList = (function componentList$(entity) {
  /* component-list eval.sibilant:18:0 */

  return R.map(spawnComponent(entity));
});
var remove = (function remove$(entity) {
  /* remove eval.sibilant:20:0 */

  return (function() {
    /* eval.sibilant:20:21 */
  
    return arguments[0].system.clear(entity);
  });
});
var clear = (function() {
  /* eval.sibilant:22:11 */

  return arguments[0].clear();
});
var System = Saveable.define("System", { 
  docString:"Shared.ecs.ComponentSystem",
  register(  ){ 
    
      return `
      Shared/ecs/ComponentSystem/register.md

      # Shared.ecs.ComponentSystem.register

      ## arguments

      no args

      ## description

      Called by
      \`ComponentSystem\`
      sub classes by initializer function.
      ## Example Usage

      \`\`\`javascript
      var NewComponent = Component.define("NewComponent", { 
        INeedSomthingFromMySystem( x ){ 

            return this.dependentProperty = (x + this.system.neededThing);

         }
       });
      var NewSystem = ComponentSystem.define("NewSystem", { 
        register(  ){ 

            this.neededThing = [];
            return (function() {
              /* inc/loops.sibilant:26:8 */

              var $for = null;
              for (var i = 0;i < 10;++(i))
              {
              $for = (function() {
                /* inc/loops.sibilant:28:35 */

                return this.neededThing.push(Math.random());
              }).call(this);
              }
              ;
              return $for;
            }).call(this);

         }
       });

      \`\`\`
      `

      ;
    
   },
  Component:Component,
  init( process = this.process,Component = this.Component,components = create(OrderedMap)(),pool = create(DynamicPool)(Component),thread = Promise.resolve() ){ 
    
      this.process = process;this.Component = Component;this.components = components;this.pool = pool;this.thread = thread;
      this.register();
      return this;
    
   },
  get system(  ){ 
    
      return this;
    
   },
  template:true,
  get game(  ){ 
    
      return this.process;
    
   },
  build(  ){ 
    
      return (function() {
        if (!((this.template))) {
          return this.init();
        }
      }).call(this);
    
   },
  clear( pool = this.pool,components = this.components,entity = this.entity ){ 
    
      components.delete(entity);
      return pool.clear();
    
   },
  get( entity = this.entity,components = this.components ){ 
    
      return components.get(entity);
    
   },
  release( c ){ 
    
      this.components.delete(c.entity);
      return this.pool.release(c);
    
   },
  spawn( entity = this.entity,pool = this.pool,components = this.components ){ 
    
      return (function(c) {
        /* inc/misc.sibilant:1:1508 */
      
        components.set(entity, c);
        return c;
      }).call(this, pool.spawn(entity, this));
    
   },
  _updateComponent( component,t ){ 
    
      throw (new Error("need to override *update-component on sub classes of component system"))
    
   },
  _prepare(  ){ 
    
   },
  _cleanup(  ){ 
    
   },
  prepare(  ){ 
    
      return this._prepare();
    
   },
  cleanup(  ){ 
    
      return this._cleanup();
    
   },
  _updateAll( t = this.t,components = this.components ){ 
    
      this.prepare();
      components.each((($fpipe) => {
      	return this._updateComponent($fpipe, t);
      }));
      return this.cleanup();
    
   },
  update( t ){ 
    
      return this.thread = this.thread.then(((nil) => {
      	return this._updateAll(t);
      }));
    
   }
 });
System.build = (function System$build$() {
  /* System.build eval.sibilant:102:0 */

  return (function() {
    if (!((this.template))) {
      return this.init();
    }
  }).call(this);
});
System.clear = (function System$clear$(pool = this.pool, components = this.components) {
  /* System.clear inc/core/function-expressions.sibilant:28:8 */

  components.clear();
  return pool.clear();
});
System.get = (function System$get$(entity = this.entity, components = this.components) {
  /* System.get inc/core/function-expressions.sibilant:28:8 */

  return components.get(entity);
});
System.update = (function System$update$(t) {
  /* System.update eval.sibilant:114:0 */

  return this.thread = this.thread.then(((nil) => {
  	return this._updateAll(t);
  }));
});
export { 
  System
 };