uniform sampler2D uTexture;
uniform vec2 uOffset;
uniform float uTime;

varying vec2 vUv;
varying vec4 vVertTexCoord; // Add this varying variable

void main() {
    vUv = uv;
    vVertTexCoord = vec4(uv, 0.0, 0.0); // Assign uv to vVertTexCoord

    vec3 newPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
