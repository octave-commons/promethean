const { 
  create,
  extend,
  mixin
 } = require("../util");
const Entity = { 
  symbol:Symbol("Entity"),
  init( pos = this.pos,world = this.world,color = this.color,collision = this.collision ){ 
    
      this.pos = pos;this.world = world;this.color = color;this.collision = collision;
      return this;
    
   },
  get r(  ){ 
    
      return this.color.red;
    
   },
  get g(  ){ 
    
      return this.color.green;
    
   },
  get b(  ){ 
    
      return this.color.blue;
    
   },
  get a(  ){ 
    
      return 255;
    
   },
  get x(  ){ 
    
      return this.pos.x;
    
   },
  set x( num ){ 
    
      return this.move(num, this.y);
    
   },
  get y(  ){ 
    
      return this.pos.y;
    
   },
  set y( num ){ 
    
      return this.move(this.x, num);
    
   },
  spawn( x = this.x,y = this.y,color = this.color ){ 
    
      let pos = world.coord.get(x, y);
      return (function() {
        if (!(world.collision.has(pos))) {
          let ent = create(this)(pos, color);
          world.add(ent);
          return ent;
        }
      }).call(this);
    
   },
  move( x = this.x,y = this.y ){ 
    
      let pos = world.coord.get(x, y);
      return (function() {
        if (!(world.collision.has(pos))) {
          world.collision.move(this, pos);
          return this.pos = pos;
        }
      }).call(this);
    
   },
  delete(  ){ 
    
      return world.delete(this);
    
   },
  random(  ){ 
    
      return this.spawn((Math.floor((Math.random() * (world.coord.width - 0))) + 0), (Math.floor((Math.random() * (world.coord.width - 0))) + 0));
    
   }
 };
exports.Entity = Entity;