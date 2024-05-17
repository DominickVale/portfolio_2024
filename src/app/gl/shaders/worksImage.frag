#include "includes/random2D.glsl"
#include "includes/imageCover.glsl"

uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;
uniform vec2 uPlaneSize;
uniform vec2 uImageSize;
uniform float uTime;
uniform bool uColorSeparation;
uniform float uAmp;
uniform float uGlitchSpeed;
uniform float uBarSize;
uniform float uNumSlices;
uniform float uCrossfade;
varying vec2 vUv;
varying vec4 vVertTexCoord; // Keep this varying variable

float randomRange (in vec2 seed, in float min, in float max) {
    return min + random2d(seed) * (max - min);
}

// return 1 if v inside 1d range
float insideRange(float v, float bottom, float top) {
   return step(bottom, v) - step(top, v);
}

void main() {
    vec2 uv = imageCover(uPlaneSize, uImageSize, vUv);
    vec3 color = texture2D(uTexture, uv).rgb;
    vec3 glitchColor = texture2D(uTexture, uv).rgb;

    float timeAdjusted = floor(uTime * uGlitchSpeed * 60.0);
    float revealProgress = smoothstep(0.0, 1.0, uTime / 5.0);

    // Randomly offset slices horizontally
    float maxOffset = uAmp / 2.0;
    for (float i = 0.0; i < uNumSlices; i += 1.0) {
        float sliceY = (i + 0.5) / uNumSlices;
        float sliceH = 1.0 / uNumSlices;
        float hOffset = randomRange(vec2(timeAdjusted, 9625.0 + float(i)), -maxOffset, maxOffset);
        vec2 uvOff = vVertTexCoord.xy;
        uvOff.x += hOffset;
        if (insideRange(vVertTexCoord.y, sliceY - sliceH / 2.0, sliceY + sliceH / 2.0) == 1.0) {
            if (random2d(vec2(timeAdjusted, 1234.0 + float(i))) < revealProgress) {
                glitchColor = texture2D(uTexture, uvOff).rgb;
            } else {
                discard;
            }
        }
    }

    // Do slight offset on one entire channel
    if (uColorSeparation) {
        float maxColOffset = uAmp / 6.0;
        float rnd = random2d(vec2(timeAdjusted, 9545.0));
        vec2 colOffset = vec2(randomRange(vec2(timeAdjusted, 9545.0), -maxColOffset, maxColOffset),
                              randomRange(vec2(timeAdjusted, 7205.0), -maxColOffset, maxColOffset));
        if (rnd < 0.33) {
            glitchColor.r = texture2D(uTexture, uv + colOffset).r;
        } else if (rnd < 0.66) {
            glitchColor.g = texture2D(uTexture, uv + colOffset).g;
        } else {
            glitchColor.b = texture2D(uTexture, uv + colOffset).b;
        }
    }

    gl_FragColor = vec4(mix(color, glitchColor, uCrossfade), uAlpha);
}
