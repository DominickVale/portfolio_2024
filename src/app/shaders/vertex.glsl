precision mediump float;

uniform float uSize;
varying vec2 vUv;
uniform sampler2D uPositionTexture;

attribute vec2 reference;

void main() {
    vUv = reference;

    vec3 pos = texture(uPositionTexture, reference).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);

    vec4 viewPosition = viewMatrix * mvPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_PointSize = uSize * (1.0 / - viewPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
