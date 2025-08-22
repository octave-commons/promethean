const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  Matrix
 } = require("./matrix");
const StateSpace = { 
  symbol:Symbol("StateSpace"),
  init( width = this.width,height = this.height,state = create(Matrix)((new Float32Array((height * width))), height, width).dmap((function() {
    /* eval.sibilant:27:83 */
  
    return 0;
  })),transition = create(Matrix)((new Float32Array((height * width))), height, width).dmap((function() {
    /* eval.sibilant:27:83 */
  
    return 0;
  })) ){ 
    
      this.width = width;this.height = height;this.state = state;this.transition = transition;
      return this;
    
   },
  resize( w = this.w,h = this.h,c = this.c ){ 
    
      return this.init.call(this, w, h);
    
   },
  get( x = this.x,y = this.y,state = this.state ){ 
    
      return this.getState(x, y, state);
    
   },
  getState( x = this.x,y = this.y,state = this.state ){ 
    
      return state.get(x, y);
    
   },
  getTransition( x = this.x,y = this.y,transition = this.transition ){ 
    
      return transition.get(x, y);
    
   },
  set( x = this.x,y = this.y,value = this.value,state = this.state ){ 
    
      return this.setState(x, y, value, state);
    
   },
  setState( x = this.x,y = this.y,value = this.value,state = this.state ){ 
    
      return state.set(x, y, value);
    
   },
  setTransition( x = this.x,y = this.y,value = this.value,transition = this.transition ){ 
    
      return transition.set(x, y, value);
    
   },
  eachState( f = this.f,state = this.state ){ 
    
      state.each(f);
      return this;
    
   },
  each( f = this.f,state = this.state ){ 
    
      state.each(f);
      return this;
    
   },
  transit( f = this.f,state = this.state,transition = this.transition ){ 
    
      return state.transit(transition, f);
    
   },
  eachTransition( f = this.f,transition = this.transition ){ 
    
      transition.each(f);
      return this;
    
   },
  clear( width = this.width,height = this.height ){ 
    
      this.clearTransitions();
      return this.clearStates();
    
   },
  clearTransitions( width = this.width,height = this.height ){ 
    
      var r = create(Matrix)([], width, height),
          setTransition = () => {
      	
        return 0;
      
      };
      return this.transition = r.dmap(setTransition);
    
   },
  clearStates( width = this.width,height = this.height ){ 
    
      var r = create(Matrix)([], width, height),
          setState = () => {
      	
        return 0;
      
      };
      return this.state = r.dmap(setState);
    
   },
  update( f = this.f,state = this.state,transition = this.transition ){ 
    
      this.state = transition;
      this.transition = state;
      return this;
    
   }
 };
exports.StateSpace = StateSpace;