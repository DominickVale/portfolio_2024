// euler integration method
precision highp float;

uniform sampler2D uPositionTexture;
uniform float uSigma;
uniform float uRho;
uniform float uBeta;
uniform float uDt;

void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( uPositionTexture, uv );
    vec3 position = tmpPos.xyz;

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

    gl_FragColor = vec4(position, 1.0);
}


// runge-khutta

// precision mediump float;

// uniform sampler2D uTexturePosition;
// uniform float uSigma;
// uniform float uRho;
// uniform float uBeta;
// uniform float uDt; // Adjust time step size as needed

// vec3 lorenz(vec3 pos) {
//     float x = pos.x;
//     float y = pos.y;
//     float z = pos.z;
//     float a = uSigma;
//     float b = uRho;
//     float c = uBeta;
//     return vec3(a * (y - x), x * (b - z) - y, x * y - c * z);
// }

// void main() {
//     vec2 uv = gl_FragCoord.xy / resolution.xy;
//     vec4 tmpPos = texture2D(uTexturePosition, uv);
//     vec3 position = tmpPos.xyz;

//     // RK4 integration
//     vec3 k1 = uDt * lorenz(position);
//     vec3 k2 = uDt * lorenz(position + 0.5 * k1);
//     vec3 k3 = uDt * lorenz(position + 0.5 * k2);
//     vec3 k4 = uDt * lorenz(position + k3);

//     vec3 newPosition = position + (k1 + 2.0*k2 + 2.0*k3 + k4) / 6.0;

//     gl_FragColor = vec4(newPosition, 1.0);
// }

