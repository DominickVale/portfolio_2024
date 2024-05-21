precision highp float;
#include "includes/imageCover.glsl"
#include "includes/random2D.glsl"
#include "includes/noise.glsl"

uniform sampler2D uTexture;
uniform sampler2D uNextTexture;
uniform float uTime;
uniform float uStrength;
uniform vec2 uPlaneSize;
uniform vec2 uImageSize;
uniform vec2 uNextImageSize;
uniform float uProgress;

varying vec2 vUv;
        
const float interval = 3.0;
const vec2 border = vec2(0.05);
const vec3 gold = vec3(1.0, 0.8, 0.5);

void main() {
  vec2 uv = imageCover(uPlaneSize, uImageSize, vUv);
  vec2 nextUv = imageCover(uPlaneSize, uNextImageSize, vUv);

  vec2 bl = step(border,vUv);
  float borderPct = bl.x * bl.y;
  vec2 tr = step(border,1.0-vUv);
  borderPct *= tr.x * tr.y;

  float strength = uStrength * smoothstep(interval * 0.5, interval, interval - mod(3., interval));
  vec2 shake = vec2(strength + 0.5) * vec2(
    random2D(vec2(uTime)) * 2.0 - 1.0,
    random2D(vec2(uTime * 2.0)) * 2.0 - 1.0
  ) / uPlaneSize;

  float y = uv.y * uPlaneSize.y;
  float rgbWave = ((
      snoise3(vec3(0.0, y * 0.01, uTime * 400.0)) * (2.0 + strength * 32.0)
      * snoise3(vec3(0.0, y * 0.02, uTime * 200.0)) * (1.0 + strength * 4.0)
      + step(0.9995, sin(y * 0.005 + uTime * 1.6)) * 12.0
      + step(0.9999, sin(y * 0.005 + uTime * 2.0)) * -18.0
    ) / uPlaneSize.x) * strength;
  float rgbDiff = ( strength * 2. ) * (6.0 + sin(uTime * 500.0 + uv.y * 40.0) * (20.0 * strength + 1.0)) / uPlaneSize.x;
  float rgbUvX = uv.x + rgbWave;
  float r = texture2D(uTexture, vec2(rgbUvX + rgbDiff, uv.y) + shake).r * borderPct;
  float g = texture2D(uTexture, vec2(rgbUvX, uv.y) + shake).g * borderPct;
  float b = texture2D(uTexture, vec2(rgbUvX - rgbDiff, uv.y) + shake).b * borderPct;

  float rn = texture2D(uNextTexture, vec2(rgbUvX + rgbDiff, uv.y) + shake).r * borderPct;
  float gn = texture2D(uNextTexture, vec2(rgbUvX, uv.y) + shake).g * borderPct;
  float bn = texture2D(uNextTexture, vec2(rgbUvX - rgbDiff, uv.y) + shake).b * borderPct;

  float whiteNoise = (random2D(uv + mod(uTime, 10.0)) * 2.0 - 1.0) * (0.15 + strength * 0.15);

  float bnTime = floor(uTime * 20.0) * 200.0;
  float noiseX = step((snoise3(vec3(0.0, uv.x * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
  float noiseY = step((snoise3(vec3(0.0, uv.y * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
  float bnMask = noiseX * noiseY * strength;
  float bnUvX = uv.x + sin(bnTime) * 0.2 + rgbWave;

  float bnR = 0.0;
  float bnG = 0.0;
  float bnB = 0.0;
  if(uProgress < 1.0){
    bnR = texture2D(uNextTexture, vec2(bnUvX + rgbDiff, uv.y)).r * bnMask;
    bnG = texture2D(uNextTexture, vec2(bnUvX, uv.y)).g * bnMask;
    bnB = texture2D(uNextTexture, vec2(bnUvX - rgbDiff, uv.y)).b * bnMask;
  } else {
    bnR = texture2D(uTexture, vec2(bnUvX + rgbDiff, uv.y)).r * bnMask;
    bnG = texture2D(uTexture, vec2(bnUvX, uv.y)).g * bnMask;
    bnB = texture2D(uTexture, vec2(bnUvX - rgbDiff, uv.y)).b * bnMask;
  }
  vec4 blockNoise = vec4(bnR, bnG, bnB, 1.0) * vec4(gold, 1.);

  float bnTime2 = floor(uTime * 25.0) * 300.0;
  float noiseX2 = step((snoise3(vec3(0.0, uv.x * 2.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.5);
  float noiseY2 = step((snoise3(vec3(0.0, uv.y * 8.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.3);
  float bnMask2 = noiseX2 * noiseY2 * strength;

  float bnR2 = 0.0;
  float bnG2 = 0.0;
  float bnB2 = 0.0;

  if(uProgress < 1.0){
    bnR2 = texture2D(uNextTexture, vec2(bnUvX + rgbDiff, uv.y)).r * bnMask2;
    bnG2 = texture2D(uNextTexture, vec2(bnUvX, uv.y)).g * bnMask2;
    bnB2 = texture2D(uNextTexture, vec2(bnUvX - rgbDiff, uv.y)).b * bnMask2;
  } else {
    bnR2 = texture2D(uTexture, vec2(bnUvX + rgbDiff, uv.y)).r * bnMask2;
    bnG2 = texture2D(uTexture, vec2(bnUvX, uv.y)).g * bnMask2;
    bnB2 = texture2D(uTexture, vec2(bnUvX - rgbDiff, uv.y)).b * bnMask2;
  }

  vec4 blockNoise2 = vec4(bnR2, bnG2, bnB2, 1.0) * vec4(gold, 1.);

  float waveNoise = (sin(uv.y * 1200.0) + 1.0) / 2.0 * (0.15 + strength * 0.2);

  if(borderPct + whiteNoise - waveNoise < 0.05){
    discard;
  }
  if(uProgress < 1.0){
    gl_FragColor = mix(vec4(r, g, b, 1.0), vec4(rn, gn, bn, 1.0), uProgress) * (1.0 - bnMask - bnMask2) + (whiteNoise + blockNoise + blockNoise2 - waveNoise) * vec4(gold, 0.5);
  } else {
    gl_FragColor = vec4(r, g, b, 1.0) * (1.0 - bnMask - bnMask2) + (whiteNoise + blockNoise + blockNoise2 - waveNoise) * vec4(gold, 0.5);
  }
}



// #include "includes/imageCover.glsl"
//
// uniform sampler2D uTexture;
// uniform float uAlpha;
// uniform float uTime;
// uniform vec2 uOffset;
// uniform vec2 uPlaneSize;
// uniform vec2 uImageSize;
//
// varying vec2 vUv;
//
// vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
//    float r = texture2D(textureImage,uv + offset).r;
//    vec2 gb = texture2D(textureImage,uv).gb;
//    return vec3(r,gb);
//  }
//
// void main() {
//     vec2 border = vec2(0.05);
//     vec2 uv = imageCover(uPlaneSize, uImageSize, vUv);
//     vec3 tex = rgbShift(uTexture,uv,uOffset);
//
//     vec2 bl = step(border,vUv);
//     float borderPct = bl.x * bl.y;
//     vec2 tr = step(border,1.0-vUv);
//     borderPct *= tr.x * tr.y;
//
//     float stripes = step(0.1, 0.5 * (sin((uv.y + uTime * 0.1) * 800.) + 1.));
//     // gl_FragColor = vec4(mix(color * stripes, vec3(0.1, 0.5, 0.2), 0.1),uAlpha);
//     vec3 glowColor = vec3(1.0, 0.9, 0.7); // Golden glow color
//     tex = mix(tex, glowColor, 0.2); // Adjust the mix factor to control the glow intensity
//     tex *= stripes;
//
//     vec3 gold = vec3(1.0, 0.8, 0.5);
//
//     tex *= gold;
//
//     gl_FragColor = vec4(tex, uAlpha * 2.0 * borderPct * stripes);
// }
