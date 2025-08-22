let toroidial = (a, lim) => {
	
  return ((a + lim) % lim);

};
const System = { 
  symbol:Symbol("System"),
  init( entities = this.entities ){ 
    
      this.entities = entities;
      return this;
    
   },
  serialize( entities = this.entities ){ 
    
      return entities.toArray().map((ent) => {
      	
        return ent.serialize();
      
      });
    
   },
  save( members = this.members ){ 
    
   },
  load( path = this.path ){ 
    
   },
  move( entities = this.entities ){ 
    
      return entities.each((ent) => {
      	
        return ent.move();
      
      });
    
   }
 };
const Entity = { 
  symbol:Symbol("Entity"),
  init( pos = this.pos,color = this.color,coord = this.coord,ent = this ){ 
    
      this.pos = pos;this.color = color;this.coord = coord;this.ent = ent;
      return this;
    
   },
  load(  ){ 
    
   },
  spawn( x = this.x,y = this.y,goals = this.goals,coord = this.coord,layer = this.layer,color = this.color ){ 
    
      let ent = coord.get(x, y);
      let data = {
        x: x,
        y: y,
        r: color.red,
        g: color.green,
        b: color.blue,
        a: 255
      };
      layer.add(data);
      return goals.add(ent);
    
   },
  move( x = this.x,y = this.y,coord = this.coord,ent = this ){ 
    
      return ent.pos = coord.get(x, y);
    
   }
 };
exports.Entity = Entity;