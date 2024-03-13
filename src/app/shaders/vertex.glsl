precision mediump float;
const float a = 10.0;
const float b = 28.0;
const float c = 8.0 / 3.0;

uniform float time;
uniform float dt; // Delta time

void main() {
  vec3 position = position.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 2.0;
}
