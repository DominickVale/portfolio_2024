precision highp float;
varying vec2 vUv;
uniform vec3 uColor;
uniform sampler2D alphaMap;

void main() {
  vec2 uv = gl_PointCoord.xy;
  vec4 a = texture2D(alphaMap, uv);
  gl_FragColor = vec4(uColor, a.r);

  gl_FragColor = vec4(mix(uColor, vec3(1.0), a.r), a.r);
  gl_FragColor = vec4(uColor, 1.0);
}
