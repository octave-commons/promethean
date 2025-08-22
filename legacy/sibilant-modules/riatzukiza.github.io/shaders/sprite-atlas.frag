#version 300 es
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
