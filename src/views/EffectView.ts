import { Sprite, Texture, ObservablePoint } from "pixi.js";
import { Tween } from "tweedle.js";
import { episodeExecutable, IView } from "../types/View";
import { IEpisodeBackground, IEpisodeEffect, IEpisodeFade, WindowEffects } from "../types/Episode";
import { baseAssets } from "../constant/advConstant";

export class EffectView extends IView implements episodeExecutable{

    // protected _canvasGroup : Container | undefined
    protected _sepiaEffectObject : Sprite;
    protected _whiteBlurEffectObject : Sprite;
    protected _whiteBlurEffectAnimation : Tween<ObservablePoint>

    protected _currentBG : string | undefined;
    protected _nextShouldHide : boolean = false;

    constructor(){
        super()

        this.sortableChildren = true;
        
        // sepia effect的顏色不確定!!!
        // 正常來說應該是用shader來做的 但會有lag問題 + 圖層問題
        // 所以暫時用圖片來做
        this._sepiaEffectObject = new Sprite(Texture.from(baseAssets.sepia));
        this._sepiaEffectObject.width = 1920;
        this._sepiaEffectObject.height = 1080;
        this._sepiaEffectObject.zIndex = 20;
        this._sepiaEffectObject.alpha = .75;
        this.addChild(this._sepiaEffectObject);
        this._sepiaEffectObject.visible = false;

        //用圖片做white blur edge effect
        this._whiteBlurEffectObject = new Sprite(Texture.from(baseAssets.whiteBlur));
        this._whiteBlurEffectObject.anchor.set(0.5);
        this._whiteBlurEffectObject.position.set(1920/2, 1080/2);
        this._whiteBlurEffectObject.zIndex = 20;
        this._whiteBlurEffectObject.visible = false;
        this.addChild(this._whiteBlurEffectObject);
        
        this._whiteBlurEffectAnimation = new Tween(this._whiteBlurEffectObject.scale).to({x : 1.025, y : 1.025}, 2000).yoyo(true).repeat();
    }
    
    public clear(): void {
        if(this._sepiaEffectObject.visible){
            this._sepiaEffectObject.visible = false;
        }
        if(this._whiteBlurEffectObject.visible){
            this._whiteBlurEffectObject.visible = false;
            this._whiteBlurEffectAnimation.stop();
        }
    }

    execute({ 
        BackgroundImageFileName,
        Effect,
        WindowEffect,
        BackgroundImageFileFadeType,
        FadeValue1 = 0,
    } : IEpisodeEffect & IEpisodeFade & IEpisodeBackground) :  (() => Promise<void>) | undefined {
        
        if(BackgroundImageFileName){
            this._currentBG = BackgroundImageFileName;
        }

        if(Effect){
            console.log('暫時沒有見過 所以不知道怎樣做!', Effect)
        }

        const FadeDuration = BackgroundImageFileFadeType ? FadeValue1 * 1000 : 0;
        
        if(FadeDuration > 0){
            return () => new Promise<void>((res, _) => {
                setTimeout(() => {
                    this._effectControl(WindowEffect, true);
                    res();
                }, FadeDuration)
            })
        }

        this._effectControl(WindowEffect);
        return;
    }

    _effectControl(WindowEffect? : WindowEffects, isFade : boolean = false){
        // 如果沒有WindowEffect 之前的有顯示的話就隱藏
        // 如果有fade animation 並且下一個unit沒有WindowEffect 則隱藏
        if((!WindowEffect) || (isFade && this._nextShouldHide) ){
            if(this._sepiaEffectObject.visible){
                this._sepiaEffectObject.visible = false;
            }
            if(this._whiteBlurEffectObject.visible){
                this._whiteBlurEffectObject.visible = false;
                this._whiteBlurEffectAnimation.stop();
            }
            return;
        }

        // 如果有WindowEffect 就顯示出來或者繼續顯示
        if(WindowEffect){
            switch (WindowEffect){
                case WindowEffects.Sepia:
                    // 黑色背景(1050)不用顯示
                    if((!this._sepiaEffectObject.visible) && this._currentBG !== "1050"){
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
            return;
        }
    }

    get epiaEffectObject(){
        return this._sepiaEffectObject;
    }

    get whiteBlurEffectObject(){
        return this._whiteBlurEffectObject;
    }

    set nextShouldHide(bool : boolean){
        this._nextShouldHide = bool;
    }

    get nextShouldHide(){
        return this._nextShouldHide;
    }

}


// --sepia effext的參考資料--

//https://github.com/karai17/awesome-love-shaders/blob/master/sepia/sepia.glsl
//https://github.com/nical/GLSL-Raymarching/blob/master/src/shaders/Sepia.frag

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
