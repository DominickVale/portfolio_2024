precision mediump float;

uniform sampler2D uTexturePosition;

void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( uTexturePosition, uv ); // get current positions from texture 
    vec3 position = tmpPos.xyz; // here is where we are getting the position of the partciles from inside the fragment shader instead of the vertex shader

    gl_FragColor = vec4( position + vec3(0.001), 1. );
}

