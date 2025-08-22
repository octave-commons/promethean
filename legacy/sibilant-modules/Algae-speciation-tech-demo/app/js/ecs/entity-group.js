const { 
  Matrix
 } = require("../matrix");
const { 
  Entity
 } = require("./entity");
const { 
  create,
  extend,
  mixin
 } = require("../util");
const EntityGroup = extend(Entity, { 
  symbol:Symbol("EntityGroup"),
  init( entityType = this.entityType,entities = (new Set()) ){ 
    
      this.entityType = entityType;this.entities = entities;
      return this;
    
   },
  serialize( entities = this.entities ){ 
    
      return entities.toArray().map((ent) => {
      	
        return ent.serialize();
      
      });
    
   },
  add( pos = this.pos,ent = this.ent,layer = this.layer,entities = this.entities ){ 
    
      return entities.add(pos, ent);
    
   },
  has( ent = this.ent,entities = this.entities ){ 
    
      return entities.has(ent);
    
   },
  each( f = this.f,entities = this.entities ){ 
    
      entities.each(f);
      return this;
    
   },
  spawn( x = this.x,y = this.y,entityType = this.entityType ){ 
    
      this.add(entityType.spawn(x, y, this));
      return this;
    
   },
  update( entities = this.entities ){ 
    
      return entities.each((ent) => {
      	
        return ent.update();
      
      });
    
   }
 });
exports.EntityGroup = EntityGroup;