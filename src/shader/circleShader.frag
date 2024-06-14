varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uTime;
uniform vec2 u_resolution;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;

void main(void)
{

    vec2 uv = gl_FragCoord.xy/u_resolution;
    uv -= 0.5;
    uv.y *= u_resolution.y / u_resolution.x;

    float r = uTime * 0.6;

    float d = length(uv);
    float c = smoothstep(r, r-0.1, d);

    if(c == 0.0){
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
    else{
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }

}