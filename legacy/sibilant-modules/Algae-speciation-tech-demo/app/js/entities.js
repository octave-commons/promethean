var entity = (function entity$(obj) {
  /* entity eval.sibilant:1:0 */

  obj.id = (entityTypes.push(obj) - 1);
  return obj;
});
const entityTypes = [];
exports.entityTypes = entityTypes;
exports.entity = entity;
const Goal = entity({ 
  name:"Goal",
  init(  ){ 
    
      
      return this;
    
   },
  draw( size = this.size,position = this.position,ctx = this.ctx ){ 
    
      ctx.fillStyle = "green";
      return ctx.fillRect((size * position.x), (position.y * size), size, size);
    
   }
 });
const Obsticle = entity({ 
  name:"Obsticle",
  init(  ){ 
    
      
      return this;
    
   },
  draw( size = this.size,position = this.position,ctx = this.ctx ){ 
    
      ctx.fillStyle = "grey";
      return ctx.fillRect((size * position.x), (position.y * size), size, size);
    
   }
 });
const Source = entity({ 
  name:"Source",
  init( position = this.position ){ 
    
      this.position = position;
      return this;
    
   },
  draw( size = this.size,position = this.position,ctx = this.ctx ){ 
    
      ctx.fillStyle = "brown";
      return ctx.fillRect((size * position.x), (position.y * size), size, size);
    
   }
 });
const Trail = entity({ 
  name:"Trail",
  init( strength = this.strength,position = this.position ){ 
    
      this.strength = strength;this.position = position;
      return this;
    
   },
  draw( size = this.size,position = this.position,strength = this.strength,ctx = this.ctx ){ 
    
      ctx.fillStyle = ("rgba(255,0,0," + strength + ")");
      return ctx.fillRect((size * position.x), (position.y * size), size, size);
    
   }
 });
const Ant = entity({ 
  name:"Ant",
  init( position = this.position,collision = this.collision,phermones = this.phermones,display = this.display,nest = this.nest ){ 
    
      this.position = position;this.collision = collision;this.phermones = phermones;this.display = display;this.nest = nest;
      return this;
    
   },
  draw( size = this.size,position = this.position,ctx = this.ctx ){ 
    
      ctx.fillStyle = "black";
      return ctx.fillRect((size * position.x), (size * position.y), size, size);
    
   },
  update( position = this.position,state = this.state,transition = this.transition ){ 
    
   }
 });