const { 
  create,
  extend,
  mixin
 } = require("../util");
const { 
  Entity
 } = require("./entity");
const EntityGroup = extend(Entity, { 
  symbol:Symbol("EntityGroup"),
  groups:(new Set()),
  init( entityType = this.entityType,entities = (new Set()),groups = this.groups ){ 
    
      this.entityType = entityType;this.entities = entities;this.groups = groups;
      groups.add(this);
      return this;
    
   },
  serialize( entities = this.entities ){ 
    
      return entities.toArray().map((ent) => {
      	
        return ent.serialize();
      
      });
    
   },
  add( ent = this.ent,entities = this.entities ){ 
    
      ent.group = this;
      return entities.add(ent);
    
   },
  has( ent = this.ent,entities = this.entities ){ 
    
      return entities.has(ent);
    
   },
  delete( ent = this.ent,entities = this.entities ){ 
    
      entities.delete(ent);
      return ent.delete();
    
   },
  remove( ent = this.ent,entities = this.entities ){ 
    
      ent.group = null;
      return entities.delete(ent);
    
   },
  each( f = this.f,entities = this.entities ){ 
    
      entities.each(f);
      return this;
    
   },
  spawn( x = this.x,y = this.y,color = this.color,entityType = this.entityType ){ 
    
      let ent = entityType.spawn(x, y, color);
      (function() {
        if (ent) {
          ent.group = this;
          this.add(ent);
          return ent;
        }
      }).call(this);
      return this;
    
   },
  update( entities = this.entities ){ 
    
      return entities.each((ent) => {
      	
        return ent.update();
      
      });
    
   }
 });
exports.EntityGroup = EntityGroup;