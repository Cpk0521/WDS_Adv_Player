varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uT;
uniform vec4 filterArea;
uniform vec2 resolution;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}


void main(void)
{

    vec2 uv = vTextureCoord;

    // uv = mapCoord(uv) / resolution;

    uv -= 0.5;
    uv.y *= resolution.y / resolution.x;

    float r = uT;
    float uSmoothRange = 0;    
    float d = length(uv);
    
    float c = smoothstep(r, r-uSmoothRange, d);
    float e = smoothstep(r-uSmoothRange, r, d);
    vec4 fc = clamp(vec4(vec3(c), e), 0.0, 1.0);

}