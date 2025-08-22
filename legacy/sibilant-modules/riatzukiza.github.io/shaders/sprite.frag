#version 300 es

precision highp float;
in float vRotation;
uniform sampler2D u_SpriteTexture;  // texture we are drawing

precision mediump float;

out vec4 FragColor;

void main() {

  float mid = 0.5;
  vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid,
                      cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid);

  vec4 rotatedTexture=texture(u_SpriteTexture, rotated);

  FragColor =  rotatedTexture;
  FragColor.rgb *= FragColor.a;
}
