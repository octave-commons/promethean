const { 
  entityTypes
 } = require("./entities");
const { 
  StateSpace
 } = require("./state-space");
const { 
  create,
  extend,
  mixin
 } = require("./util");
const Collison = extend(StateSpace, { 
  symbol:Symbol("Collison"),
  update( rules = this.rules,state = this.state,transition = this.transition,neighborhood = this.neighborhood ){ 
    
      let update = (v, x, y, m) => {
      	
        return entityTypes[v].update({ 
          x,
          y
         }, state, transition, neighborhood);
      
      };
      return this.transit(update);
    
   }
 });