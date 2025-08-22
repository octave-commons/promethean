const Nest = { 
  symbol:Symbol("Nest"),
  init( pos = this.pos,collision = this.collision,display = this.display,pheremons = this.pheremons,ants = [] ){ 
    
      this.pos = pos;this.collision = collision;this.display = display;this.pheremons = pheremons;this.ants = ants;
      return this;
    
   },
  spawn(  ){ 
    
   },
  despawn( id = this.id ){ 
    
   }
 }