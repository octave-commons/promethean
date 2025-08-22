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
  Component,
  System
 } from "../../ecs.js";
import { 
  Physics
 } from "../physics.js";
import { 
  Position
 } from "../position.js";
import { 
  Gl
 } from "../../gl.js";
import { 
  Vector
 } from "../../vectors.js";
import { 
  Andy
 } from "../../andy.js";
import { 
  Renderable
 } from "./renderable.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
var setPoint = (function setPoint$(x, y, z, vert) {
  /* set-point eval.sibilant:13:0 */

  vert.point.x = x;
  vert.point.y = y;
  return vert.point.z = z;
});
var SpriteAtlasRenderable = Renderable.define("SpriteAtlasRenderable", { 
  init( layer = this.layer ){ 
    
      this.layer = layer;
      return this;
    
   },
  structure:(new Andy.Gl.Type.Composite({ 
    point:Andy.Type.Vector3,
    size:Andy.Type.float,
    alpha:Andy.Type.float,
    spriteStartUV:Andy.Type.Vector2,
    spriteEndUV:Andy.Type.Vector2
   })),
  clear(  ){ 
    
      setPoint(0, 0, 0, this);
      return this.point.scale = 0;
    
   },
  despawn(  ){ 
    
      return this.layer.despawn(this);
    
   }
 });
export { 
  SpriteAtlasRenderable
 };
var uniforms = Interface.define("uniforms", { 
  init( game = this.game ){ 
    
      this.game = game;
      return this;
    
   },
  get res(  ){ 
    
      return (() => {
      	return Gl.uniform("Vector2", "Resolution", this.game.config.dimensions);
      });
    
   },
  get zoom(  ){ 
    
      return (() => {
      	return Gl.uniform("Vector3", "Zoom", [ 1, 1, this.game.rendering.zoomLevel ]);
      });
    
   },
  get offset(  ){ 
    
      return (() => {
      	return Gl.uniform("Vector3", "Offset", [ this.game.rendering.xOffset, this.game.rendering.yOffset, 0 ]);
      });
    
   },
  get scale(  ){ 
    
      return (() => {
      	return Gl.uniform("Float", "Scale", this.game.rendering.zoomLevel);
      });
    
   },
  id:0,
  get spriteTexture(  ){ 
    
      return Gl.uniform("Integer", "SpriteTexture", ((this.id)++));
    
   }
 });
var shaders = Interface.define("shaders", { 
  vert:`#version 300 es
  in vec3 a_point;
  in float a_size;
  in vec2 a_spriteStartUV;
  in vec2 a_spriteEndUV;

  in float a_alpha;

  out highp vec2 vSpriteStartUV;
  out highp vec2 vSpriteEndUV;
  out highp float vAlpha;

  uniform vec2  u_Resolution;
  uniform  float u_Scale;
  uniform vec3 u_Zoom;
  uniform vec3 u_Offset;

  vec4 clipspace_coordinate (vec3 xyz, float scale, vec2 res)
  {
    return (vec4((((xyz + u_Offset) * u_Zoom * scale)
                  / vec3(res,1.0)), 1.0)
            * vec4( 1.0,-1.0,1.0,1.0 ));

  }
  void main (void)
  {

    float zAxis = a_point[2];
    vec3 p = vec3(a_point);
    p.z = 0.0;

    gl_Position  = clipspace_coordinate( p, u_Scale, u_Resolution );
    gl_PointSize = (a_size + zAxis) * u_Scale;
    vSpriteStartUV = a_spriteStartUV;
    vSpriteEndUV = a_spriteEndUV;
    vAlpha = a_alpha;

      //size * z
      // so that the closer the vertex is (the larger z is), the larger the vertex will be relative to its physical size

  }
  `,
  frag:`#version 300 es
  // I'm passing these in as uniforms but you can pass them in as varyings
  // from buffers if that fits your needs better

  // in vec2 animatedUV;      // animation value
  precision highp float;
  in vec2 vSpriteStartUV;   // corner uv coord for sprite in atlas
  precision highp float;
  in vec2 vSpriteEndUV;     // opposite corner uv coord for sprite in atlas
  precision highp float;
  in float vAlpha;

  uniform sampler2D u_SpriteTexture;  // texture we are drawing

  out vec4 FragColor;
  void main() {
    vec2 texcoord = gl_PointCoord.xy;
    vec2 spriteRange = (vSpriteEndUV - vSpriteStartUV);
    vec2 uv = vSpriteStartUV + texcoord * spriteRange;

    vec4 color = texture(u_SpriteTexture, uv);
    color.a *= vAlpha;
    FragColor = color;

    // FragColor.rgb *= FragColor.a;

  }
  `
 });
var Texture = Interface.define("Texture", { 
  init( img = this.img,context = this.context,id = this.id,texture = gl.createTexture() ){ 
    
      this.img = img;this.context = context;this.id = id;this.texture = texture;
      const gl=context.gl;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      return this;
    
   },
  get gl(  ){ 
    
      return this.context.gl;
    
   },
  enable( img = this.img,texture = this.texture,gl = this.gl ){ 
    
      gl.activeTexture((gl.TEXTURE0 + this.id));
      return gl.bindTexture(gl.TEXTURE_2D, texture);
    
   }
 });
var spriteLayer = (function spriteLayer$(limit, textureData, game) {
  /* sprite-layer eval.sibilant:96:0 */

  uniforms.init(game);
  var id = uniforms.id;
  const layer=game.rendering.spawn(limit, SpriteAtlasRenderable, [ uniforms.res, uniforms.scale, uniforms.zoom, uniforms.offset, uniforms.spriteTexture ], [ shaders.vert, shaders.frag ]);
  layer.texture = create(Texture)(textureData, game.rendering.context, id);
  return layer;
});
var AnimatedSprite = Component.define("AnimatedSprite", { 
  get pos(  ){ 
    
      return this.entity.positionInterface;
    
   },
  get scale(  ){ 
    
      return this.entity.physicalProperties.scale;
    
   },
  get point(  ){ 
    
      return this.sprite.point;
    
   },
  _column:0,
  _row:0,
  _alpha:1,
  _nonSerializableKeys:[ "sprite" ],
  get column(  ){ 
    
      return this._column;
    
   },
  get row(  ){ 
    
      return this._row;
    
   },
  set column( c ){ 
    
      this._column = c;
      return this.system.queue.push(this);
    
   },
  set row( r ){ 
    
      this._row = r;
      return this.system.queue.push(this);
    
   },
  get alpha(  ){ 
    
      return this._alpha;
    
   },
  set alpha( a ){ 
    
      this._alpha = a;
      return this.system.queue.push(this);
    
   },
  get atlasXMin(  ){ 
    
      return ((this.column * this.system.frameDimensions[0]));
    
   },
  get atlasYMin(  ){ 
    
      return ((this.row * this.system.frameDimensions[1]));
    
   },
  get atlasXMax(  ){ 
    
      return (this.atlasXMin + this.system.frameDimensions[0]);
    
   },
  get atlasYMax(  ){ 
    
      return (this.atlasYMin + this.system.frameDimensions[1]);
    
   },
  register(  ){ 
    
      return (function() {
        if (!(this.sprite)) {
          return this.sprite = this.system.sprites.spawn();
        }
      }).call(this);
    
   },
  redraw(  ){ 
    
      return this.system.queue.push(this);
    
   },
  _clear(  ){ 
    
      this.point.x = 0;
      this.point.y = 0;
      this.point.z = 0;
      return this.sprite.size = 0;
    
   }
 });
export { 
  AnimatedSprite
 };
var SpriteAtlas = System.define("SpriteAtlas", { 
  maxSprites:100000,
  _nonSerializableKeys:[ "sprites", "queue" ],
  register(  ){ 
    
      this.queue = [];
      return this.sprites = spriteLayer(this.maxSprites, this.img, this.game);
    
   },
  Component:AnimatedSprite,
  spawn( entity ){ 
    
      var c = System.spawn.call(this, entity);
      this.queue.push(c);
      return c;
    
   },
  get texture(  ){ 
    
      return this.sprites.texture;
    
   },
  _prepare(  ){ 
    
      return this.texture.enable();
    
   },
  _updateAll(  ){ 
    
      this.prepare();
      return (function() {
        var while$99 = undefined;
        while (this.queue.length) {
          while$99 = (function() {
            return this._updateComponent(this.queue.pop());
          }).call(this);
        };
        return while$99;
      }).call(this);
    
   },
  _updateComponent( dot ){ 
    
      dot.sprite.alpha = dot.alpha;
      dot.sprite.point.x = dot.pos.x;
      dot.sprite.point.y = dot.pos.y;
      dot.sprite.point.z = dot.pos.z;
      dot.sprite.spriteStartUV.x = ((0.5 + dot.atlasXMin) / this.img.width);
      dot.sprite.spriteStartUV.y = ((0.5 + dot.atlasYMin) / this.img.height);
      dot.sprite.spriteEndUV.x = (((0.5 + dot.atlasXMax) - 1) / this.img.width);
      dot.sprite.spriteEndUV.y = (((0.5 + dot.atlasYMax) - 1) / this.img.height);
      return dot.sprite.size = (0.5 * (2 + dot.scale));
    
   }
 });
export { 
  SpriteAtlas
 };