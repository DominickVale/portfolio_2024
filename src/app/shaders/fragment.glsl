precision mediump float;
varying vec2 vUv;
uniform vec3 uColor;
uniform sampler2D alphaMap;

void main() {
  // vec2 uv = gl_PointCoord.xy;
  // vec4 a = texture2D(alphaMap, uv);
  // gl_FragColor = vec4(uColor, a.r);

  // gl_FragColor = vec4(mix(uColor, vec3(1.0), a.r), a.r);
  // gl_FragColor = vec4(uColor, 1.0);


    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 8.0);

    vec3 color = mix(vec3(0.0), uColor, strength);
    gl_FragColor = vec4(color, 1.0);
}
