precision mediump float;

uniform float uSize;
varying vec2 vUv;
uniform sampler2D uPositionTexture;

attribute vec2 reference;

void main() {
    vUv = reference;

    vec3 pos = texture(uPositionTexture, reference).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);

    // gl_PointSize = uSize * (1.0 / -mvPosition.z);
    gl_PointSize = uSize * (1.0 / -(mvPosition.z / 2.));
    gl_Position = projectionMatrix * mvPosition;
}
