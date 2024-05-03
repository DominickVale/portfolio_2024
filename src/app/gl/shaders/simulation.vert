// varying vec2 vUv;
// uniform sampler2D uTexture;

void main() {
  // vec4 texel = texture2D(uTexture, position.xy);
  // vec3 pos = texel.xyz;
    // vUv = uv;
    gl_Position = vec4(position, 1.0);
}


