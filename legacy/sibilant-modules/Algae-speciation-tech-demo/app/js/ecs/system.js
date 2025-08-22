const { 
  Matrix
 } = require("../matrix");
var makePool = (function makePool$(width, entType) {
  /* make-pool eval.sibilant:2:0 */

  return create(Matrix)([], width, width).dmap((function(nil, x, y) {
    /* eval.sibilant:4:9 */
  
    return create(entType)(x, y, 0, 0, 0, 0);
  }));
});
const EntityGroup = { 
  symbol:Symbol("EntityGroup"),
  init( sim = this.sim,entityType = this.entityType,color = this.color,entities = (new Map()),layer = sim.layers.get() ){ 
    
      this.sim = sim;this.entityType = entityType;this.color = color;this.entities = entities;this.layer = layer;
      return this;
    
   },
  serialize( entities = this.entities ){ 
    
      return entities.toArray().map((ent) => {
      	
        return ent.serialize();
      
      });
    
   },
  set( pos = this.pos,ent = this.ent,layer = this.layer,entities = this.entities ){ 
    
      layer.add(ent.data);
      return entities.set(pos, ent);
    
   },
  has( pos = this.pos,entities = this.entities ){ 
    
      return entities.has(pos);
    
   },
  add( pos = this.pos,entityType = this.entityType ){ 
    
      console.log("adding type thing", entityType);
      entityType.spawn(pos.x, pos.y, this);
      return this;
    
   },
  random( entityType = this.entityType,sim = this.sim ){ 
    
      return entityType.spawn(Math.floor((Math.random() * ((sim.coord.width - 0) + 0))), Math.floor((Math.random() * ((sim.coord.width - 0) + 0))), this);
    
   },
  update( entities = this.entities ){ 
    
      return entities.each((ent) => {
      	
        console.log("ENT", ent);
        return ent.update();
      
      });
    
   }
 };
exports.EntityGroup = EntityGroup;