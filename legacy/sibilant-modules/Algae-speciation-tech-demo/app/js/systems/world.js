const { 
  Collision
 } = require("./collision");
const { 
  create
 } = require("../util");
const World = { 
  symbol:Symbol("World"),
  entities:(new Set()),
  init( coord = this.coord,rendering = this.rendering,collision = create(Collision)(coord) ){ 
    
      this.coord = coord;this.rendering = rendering;this.collision = collision;
      return this;
    
   },
  add( ent = this.ent,rendering = this.rendering,collision = this.collision,coord = this.coord,entities = this.entities ){ 
    
      rendering.entities.add(ent);
      entities.add(ent);
      return collision.set(ent.pos, ent);
    
   },
  delete( ent = this.ent,rendering = this.rendering,collision = this.collision,coord = this.coord,entities = this.entities ){ 
    
      rendering.entities.delete(ent);
      entities.delete(ent);
      return collision.delete(ent.pos);
    
   },
  update( entities = this.entities ){ 
    
      return entities.each((ent) => {
      	
        return ent.update();
      
      });
    
   }
 };
exports.World = World;