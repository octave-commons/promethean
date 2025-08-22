const Collision = { 
  symbol:Symbol("Collision"),
  init( coord = this.coord,entities = (new Map()) ){ 
    
      this.coord = coord;this.entities = entities;
      return this;
    
   },
  serialize( entities = this.entities ){ 
    
      return entities.toArray().map((ent) => {
      	
        return ent.serialize();
      
      });
    
   },
  move( ent = this.ent,pos = this.pos,entities = this.entities ){ 
    
      entities.delete(ent.pos);
      return entities.set(pos, ent);
    
   },
  check( x = this.x,y = this.y,coord = this.coord ){ 
    
      return this.has(coord.get(x, y));
    
   },
  set( pos = this.pos,ent = this.ent,entities = this.entities ){ 
    
      return entities.set(pos, ent);
    
   },
  get( x = this.x,y = this.y,entities = this.entities,coord = this.coord ){ 
    
      return entities.get(coord.get(x, y));
    
   },
  delete( key = this.key ){ 
    
      return this.entities.delete(key);
    
   },
  has( pos = this.pos,entities = this.entities ){ 
    
      return entities.has(pos);
    
   }
 };
exports.Collision = Collision;