#version 300 es
in vec3 a_point;
in vec4 a_color;
in float a_size;

out highp vec4 vColor;

uniform vec2  u_Resolution;
uniform float u_Scale;
vec4 clipspace_coordinate (vec3 xyz, float scale, vec2 res)
{
  return (vec4(((xyz * vec3(1.0,1.0,1.0) * scale)
                / vec3(res,1.0) * 1.98 - 0.99), 1.0)
          * vec4( 1.0,-1.0,1.0,1.0 ));

}
void main (void)
{

  float zAxis = a_point[2];
  vec3 p = vec3(a_point);
  p.z = 1.0;

  gl_Position  = clipspace_coordinate( p, u_Scale, u_Resolution );
  gl_PointSize = a_size + zAxis;

  //size * z
  // so that the closer the vertex is (the larger z is), the larger the vertex will be relative to its physical size

  vColor       = a_color;

}
