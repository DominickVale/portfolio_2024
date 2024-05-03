precision highp float;
uniform sampler2D uTexture;
uniform float uSize;

varying vec2 vUv;

attribute vec2 reference;

void main() {
  vUv = uv;
  vec3 pos = texture(uTexture, reference).rgb;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = uSize * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
