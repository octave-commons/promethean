#version 300 es
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
