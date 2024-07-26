precision highp float;
varying vec2 vUv;
uniform vec3 uColor;
uniform sampler2D alphaMap;

void main() {
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 8.0);

  vec3 color = mix(vec3(0.0), uColor, strength);
  gl_FragColor = vec4(color, 1.0);
}
