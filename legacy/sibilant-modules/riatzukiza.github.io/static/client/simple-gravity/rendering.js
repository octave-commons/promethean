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
  Rendering
 } from "/shared/systems/rendering/rendering.js";
import { 
  Mote
 } from "/shared/systems/rendering/mote.js";
import { 
  Interface
 } from "/shared/kit/interface/index.js";
import { 
  Gl
 } from "/shared/gl.js";
import { 
  config
 } from "./config.js";
const rendering=Rendering.load({ 
  dimensions:[ (1 * config.dimensions[0]), (1 * config.dimensions[1]) ],
  blend:true
 });
rendering.backgroundColor = { 
  r:0,
  g:0,
  b:0,
  a:255
 };
export { 
  rendering
 };
var shaders = Interface.define("shaders", { 
  vert:`#version 300 es
  in vec3 a_point;
  in vec4 a_color;
  in float a_size;
  in float a_intensity;

  out highp vec4 vColor;
  out highp vec3 vPoint;
  out highp float vSize;
  out highp float vIntensity;

  uniform vec2  u_Resolution;
  uniform float u_Scale;
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
    p.z = 1.0;

    gl_Position  = clipspace_coordinate( p, u_Scale, u_Resolution );

    gl_PointSize = (a_size + zAxis) * u_Scale;

    vColor       = a_color;
    vPoint       = p;
    vSize = a_size;
    vIntensity = a_intensity;

  }
  `,
  frag:`#version 300 es
  precision mediump float;

  in  vec4 vColor;
  in  vec3 vPoint;
  in  float vSize;
  in  float vIntensity;

  out vec4 FragColor;

  void main(void) {
    FragColor = vColor;
    float dist = distance(vec2(0.5,0.5),gl_PointCoord.xy)*vSize;
    FragColor.a = vIntensity/pow(dist, 2.0);
  }
  `
 });
var uniforms = Interface.define("uniforms", { 
  get res(  ){ 
    
      return (() => {
      	return Gl.uniform("Vector2", "Resolution", config.dimensions);
      });
    
   },
  get zoom(  ){ 
    
      return (() => {
      	return Gl.uniform("Vector3", "Zoom", [ 1, 1, rendering.zoomLevel ]);
      });
    
   },
  get offset(  ){ 
    
      return (() => {
      	return Gl.uniform("Vector3", "Offset", [ rendering.xOffset, rendering.yOffset, 0 ]);
      });
    
   },
  get scale(  ){ 
    
      return (() => {
      	return Gl.uniform("Float", "Scale", rendering.zoomLevel);
      });
    
   }
 });
var vertexLayer = (function vertexLayer$(limit) {
  /* vertex-layer eval.sibilant:34:0 */

  const context=rendering.context;
  const layer=rendering.spawn(limit, Mote, [ uniforms.res, uniforms.scale, uniforms.zoom, uniforms.offset ], [ shaders.vert, shaders.frag ]);
  const verts=[];
  (function() {
    /* inc/loops.sibilant:26:8 */
  
    var $for = null;
    for (var i = 0;i < limit;++(i))
    {
    $for = (function() {
      /* inc/loops.sibilant:28:35 */
    
      return verts.push(layer.spawn());
    }).call(this);
    }
    ;
    return $for;
  }).call(this);
  return verts;
});
export { 
  vertexLayer
 };