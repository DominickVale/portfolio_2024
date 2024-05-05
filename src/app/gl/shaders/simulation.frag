precision highp float;
uniform float uTime;
uniform float uSigma;
uniform float uRho;
uniform float uBeta;
uniform float uDt;
uniform sampler2D uTexture;
uniform sampler2D uInitialPosition;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( uTexture, uv);
    vec3 initialPos = texture2D(uInitialPosition, uv).rgb;
    vec3 position = tmpPos.xyz;

    if (length(position) > 100.0) {
      position /= 100.0;
    } else {

    // Update the particle position using the Lorenz equations
    float a = uSigma;
    float b = uRho;
    float c = uBeta;
    float x = position.x;
    float y = position.y;
    float z = position.z;

    float dx = (a * (y - x)) * uDt;
    float dy = (x * (b - z) - y) * uDt;
    float dz = (x * y - c * z) * uDt;

    position.x = x + dx;
    position.y = y + dy;
    position.z = z + dz;

  }
    gl_FragColor = vec4(position, 1.0);
}
