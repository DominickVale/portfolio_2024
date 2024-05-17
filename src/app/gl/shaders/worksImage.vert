#include "includes/random2D.glsl"
uniform sampler2D uTexture;
uniform vec2 uOffset;
uniform float uTime;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 newPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
