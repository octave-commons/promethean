#version 300 es
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
