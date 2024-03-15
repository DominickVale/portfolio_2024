precision mediump float;

varying vec2 vUv;
uniform vec3 uColor;

uniform sampler2D  uStarTexture;

void main() {
    vec4 texture = texture2D(uStarTexture, vUv);
    gl_FragColor = vec4(texture.rgb, texture.a);
    // gl_FragColor = vec4(mix(vec3(1.0, 1.0, 1.0), uColor, 0.9),1.0);
}
