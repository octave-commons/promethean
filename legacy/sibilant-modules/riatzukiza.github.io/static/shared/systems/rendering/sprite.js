Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
import { 
  MatrixMap
 } from "../../data-structures/maps/matrix.js";
import { 
  uniforms
 } from "../../gl.js";
var SpriteInterface = Component.define("SpriteInterface", { 
  register( dim = this.dim,system = this.system ){ 
    
      return this.verts = create(MatrixMap)(dim, (function(array) {
        /* eval.sibilant:2:327 */
      
        (function() {
          /* inc/loops.sibilant:26:8 */
        
          var $for = null;
          for (var i = 0;i < productOf(dim);++(i))
          {
          $for = (function() {
            /* inc/loops.sibilant:28:35 */
          
            array.push((function() {
              /* eval.sibilant:2:398 */
            
              return system.verts.spawn();
            }).call(this));
            return array;
          }).call(this);
          }
          ;
          return $for;
        }).call(this);
        return array;
      }).call(this, []));
    
   },
  frameId:0,
  delay:1,
  get pos(  ){ 
    
      return Position.get(this.entity);
    
   },
  get dim(  ){ 
    
      return this.data.dim;
    
   },
  get image(  ){ 
    
      return Promise.resolve(this.data.image);
    
   },
  get frameCount(  ){ 
    
      return this.data.frameCount;
    
   },
  get scale(  ){ 
    
      return this.data.scale;
    
   },
  get orientation(  ){ 
    
      return this.data.orientation;
    
   },
  get height(  ){ 
    
      return this.dim[1];
    
   },
  get width(  ){ 
    
      return this.dim[0];
    
   },
  get x(  ){ 
    
      return this.pos.x;
    
   },
  get y(  ){ 
    
      return this.pos.y;
    
   },
  getFramePixel( i = this.i,j = this.j,bitMap = this.bitMap,width = this.width,frameId = this.frameId,frameCount = this.frameCount,image = this.image ){ 
    
      return bitMap.get([ (i + (width * (frameId % frameCount))), j ]);
    
   },
  moveVertex( i = this.i,j = this.j,scale = this.scale,v = this.v,pos = this.pos,height = this.height,width = this.width,orientation = this.orientation ){ 
    
      v.point.x = (((pos.x - ((width * scale * orientation[0]) / 2)) + (i * scale * orientation[0])) % this.game.rendering.dimensions[0]);
      v.point.y = (((pos.y - ((height * scale * orientation[1]) / 2)) + (j * scale * orientation[1])) % this.game.rendering.dimensions[1]);
      return v.point.z = 0;
    
   },
  setColor( v,pixel ){ 
    
      v.color.r = pixel.r;
      v.color.g = pixel.g;
      v.color.b = pixel.b;
      return v.color.a = pixel.a;
    
   },
  step(  ){ 
    
      return this.frameId = ((this.frameId + 1) % this.frameCount);
    
   },
  draw( t = this.t,verts = this.verts,image = this.image,scale = this.scale,frameId = this.frameId,frameCount = this.frameCount,pos = this.pos,height = this.height,width = this.width ){ 
    
      return image.then(((bitMap) => {
      	return verts.each(((v, [ i, j ]) => {
      	var pixel = this.getFramePixel(i, j, bitMap);
      this.moveVertex(i, j, scale, v);
      v.size = scale;
      return this.setColor(v, pixel);
      }));
      }));
    
   }
 });
export { 
  SpriteInterface
 };
var Sprite = ComponentSystem.define("Sprite", { 
  register(  ){ 
    
      return this.verts = this.game.rendering.spawn(1000000, Vertex, [ uniforms.res, uniforms.scale ], [ vertShader(), fragmentShaderString ]);
    
   },
  interface:SpriteInterface,
  _updateComponent( sprite,t ){ 
    
      return sprite.draw(t);
    
   }
 });
export { 
  Sprite
 };