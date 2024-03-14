uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}


// precision mediump float;
// const float a = 10.0;
// const float b = 28.0;
// const float c = 8.0 / 3.0;
// const float dt = 0.01;

// uniform float uTime;
// uniform float uSize;

// void main() {
//   vec4 modelPosition = modelMatrix * vec4(position, 1.0);

//   float x = modelPosition.x;
//   float y = modelPosition.y;
//   float z = modelPosition.z;

//   float dt = 0.01;
//   float dx = (a * (y - x)) * dt;
//   float dy = (x * (b - z) - y) * dt;
//   float dz = (x * y - c * z) * dt;
//   modelPosition.x = x + dx;
//   modelPosition.y = y + dy;
//   modelPosition.z = z + dz;

//   vec4 viewPosition = viewMatrix * modelPosition;
//   vec4 projectedPosition = projectionMatrix * viewPosition;
//   gl_Position = projectedPosition;

//   gl_PointSize *= uSize * (1.0 / - viewPosition.z);
// }
