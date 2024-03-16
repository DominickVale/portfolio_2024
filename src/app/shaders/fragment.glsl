precision mediump float;

varying vec2 vUv;
uniform vec3 uColor;

uniform sampler2D  uStarTexture;

void main() {
    // vec4 texture = texture2D(uStarTexture, vUv);
    // gl_FragColor = vec4(texture.rgb, texture.a);
    // gl_FragColor = vec4(mix(vec3(1.0, 1.0, 1.0), uColor, 0.95),1.0);
    vec4 pixelref= texture2D( uStarTexture, gl_PointCoord );
    gl_FragColor = vec4(uColor, pixelRef.a);
}
