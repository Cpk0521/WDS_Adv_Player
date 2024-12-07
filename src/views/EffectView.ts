//https://github.com/karai17/awesome-love-shaders/blob/master/sepia/sepia.glsl
//https://github.com/nical/GLSL-Raymarching/blob/master/src/shaders/Sepia.frag
import { Sprite, Texture, ObservablePoint } from "pixi.js";
import { Tween } from "tweedle.js";
import { IView } from "../types/View";
import { IEpisodeEffect, IEpisodeFade, WindowEffects } from "../types/Episode";
import { baseAssets } from "../constant/advConstant";

export class EffectView extends IView {

    // protected _canvasGroup : Container | undefined
    protected _sepiaEffectObject : Sprite;
    protected _whiteBlurEffectObject : Sprite;
    // protected _blur_filter : BlurFilter;
    // protected _sepia_filter : Filter;
    protected _whiteBlurEffectAnimation : Tween<ObservablePoint>

    constructor(){
        super()

        this.sortableChildren = true;
        
        // sepia setting 顏色不確定!!!
        // this._sepia_filter = new Filter(undefined, fragmentShader);
        // this.filters = [this._sepia_filter];
        // this._sepia_filter.enabled = false;
        this._sepiaEffectObject = new Sprite(Texture.from(baseAssets.sepia));
        this._sepiaEffectObject.width = 1920;
        this._sepiaEffectObject.height = 1080;
        this._sepiaEffectObject.zIndex = 20;
        this._sepiaEffectObject.alpha = .75;
        this.addChild(this._sepiaEffectObject);
        this._sepiaEffectObject.visible = false;

        // //white blur edge effect setting
        // this._whiteBlurEffectObject = new Graphics();
        // this._whiteBlurEffectObject.zIndex = 20;
        // this._whiteBlurEffectObject.lineStyle(90, 0xffffff);
        // this._whiteBlurEffectObject.drawRect(0, 0, 1920, 1080);
        // this._whiteBlurEffectObject.visible = false;
        // this.addChild(this._whiteBlurEffectObject)

        //用圖片做white blur edge effect
        this._whiteBlurEffectObject = new Sprite(Texture.from(baseAssets.whiteBlur));
        this._whiteBlurEffectObject.anchor.set(0.5);
        this._whiteBlurEffectObject.position.set(1920/2, 1080/2);
        this._whiteBlurEffectObject.zIndex = 20;
        this._whiteBlurEffectObject.visible = false;
        this.addChild(this._whiteBlurEffectObject);

        // //blur filter setting
        // this._blur_filter = new BlurFilter();
        // this._whiteBlurEffectObject.filters = [this._blur_filter];
        // this._blur_filter.enabled = false;
        // this._blur_filter.blur = 60;
        // this._blur_filter.quality = 20;
        
        // this._whiteBlurEffectAnimation = new Tween(this._blur_filter.uniforms).to({blur : 80}, 2000).yoyo(true).repeat();
        this._whiteBlurEffectAnimation = new Tween(this._whiteBlurEffectObject.scale).to({x : 1.025, y : 1.025}, 2000).yoyo(true).repeat();
    }
    
    public clear(): void {
        if(this._sepiaEffectObject.visible){
            this._sepiaEffectObject.visible = false;
        }
        // this._sepia_filter.enabled = false;
        // this.filters = [];

        if(this._whiteBlurEffectObject.visible){
            this._whiteBlurEffectObject.visible = false;
            // this._blur_filter.enabled = false;
            this._whiteBlurEffectAnimation.stop();
        }
    }

    execute({ 
        Effect, 
        WindowEffect,
        BackgroundImageFileFadeType,
        FadeValue1 = 0,
    } : IEpisodeEffect & IEpisodeFade) :  (() => Promise<void>) | undefined {
        
        if(Effect){
            console.log('暫時沒有見過 所以不知道怎樣做!', Effect)
        }

        const FadeDuration = BackgroundImageFileFadeType ? FadeValue1 * 1000 : 0;
        
        if(FadeDuration > 0){
            return () => new Promise<void>((res, _) => {
                setTimeout(() => {
                    this._effectControl(WindowEffect);
                    res();
                }, FadeDuration)
            })
        }

        this._effectControl(WindowEffect);
        return;
    }

    _effectControl(WindowEffect? : WindowEffects){
        // 如果沒有WindowEffect 之前的有顯示的話就隱藏
        if(!WindowEffect){
            if(this._sepiaEffectObject.visible){
                this._sepiaEffectObject.visible = false;
            }
            // if(this._sepia_filter.enabled){
            //     this._sepia_filter.enabled = false;
            // }
            if(this._whiteBlurEffectObject.visible){
                this._whiteBlurEffectObject.visible = false;
                // this._blur_filter.enabled = false;
                this._whiteBlurEffectAnimation.stop();
            }
            return;
        }

        // 如果有WindowEffect 就顯示出來或者繼續顯示
        if(WindowEffect){
            switch (WindowEffect){
                case WindowEffects.Sepia:
                    if(!this._sepiaEffectObject.visible){
                        this._sepiaEffectObject.visible = true;
                    }
                    break;
                case WindowEffects.WhiteBlur:
                    if(!this._whiteBlurEffectObject.visible){
                        this._whiteBlurEffectObject.visible = true;                        
                        this._whiteBlurEffectAnimation.start();
                    }
                    break;
            }
        }
    }

    get epiaEffectObject(){
        return this._sepiaEffectObject;
    }

    get whiteBlurEffectObject(){
        return this._whiteBlurEffectObject;
    }

}


// const fragmentShader = `
//     varying vec2 vTextureCoord;
//     uniform sampler2D uSampler;

//     float u_opacity = 0.75;

//     void main() {
//         vec4 texColor = texture2D(uSampler, vTextureCoord);
//         float grey = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
//         vec4 sepia = vec4(grey, grey, grey, u_opacity);
//         sepia *= vec4(1.0, 0.95, 0.82, u_opacity);
//         gl_FragColor = sepia;
//     }
// `