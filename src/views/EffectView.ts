import { Graphics, BLEND_MODES, BlurFilter } from "pixi.js";
import { Tween } from "tweedle.js";
import { IViewController, IView } from "../types/View";
import { IEpisodeEffect, WindowEffects } from "../types/Episode";

export class EffectView extends IView implements IViewController{

    protected _sepiaEffectObject : Graphics;
    protected _whiteBlurEffectObject : Graphics;
    protected _blur_filter : BlurFilter;
    protected _whiteBlurEffectAnimation : Tween<Record<string, any>>

    constructor(){
        super()

        //sepia setting 顏色不確定!!!
        this._sepiaEffectObject = new Graphics();
        this._sepiaEffectObject.beginFill(0xECD543); // new Color(0.5568628, 0.380392164, 0.380392164, 1 )
        this._sepiaEffectObject.drawRect(0, 0, 1920, 1080);
        this._sepiaEffectObject.blendMode = BLEND_MODES.MULTIPLY;
        this.addChild(this._sepiaEffectObject);
        this._sepiaEffectObject.visible = false;


        //white blur edge effect setting
        this._whiteBlurEffectObject = new Graphics();
        this._whiteBlurEffectObject.lineStyle(90, 0xffffff);
        this._whiteBlurEffectObject.drawRect(0, 0, 1920, 1080);
        this._whiteBlurEffectObject.visible = false;
        this.addChild(this._whiteBlurEffectObject)
        
        //blur filter setting
        this._blur_filter = new BlurFilter();
        this._whiteBlurEffectObject.filters = [this._blur_filter];
        this._blur_filter.enabled = false;
        this._blur_filter.blur = 60;
        this._blur_filter.quality = 20;
        
        this._whiteBlurEffectAnimation = new Tween(this._blur_filter.uniforms).to({blur : 80}, 2000).yoyo(true).repeat();
    }
    
    public clear(): void {
        if(this._sepiaEffectObject.visible){
            this._sepiaEffectObject.visible = false;
        }

        if(this._whiteBlurEffectObject.visible){
            this._whiteBlurEffectObject.visible = false;
            this._blur_filter.enabled = false;
            this._whiteBlurEffectAnimation.stop();
        }
    }

    execute(effect : IEpisodeEffect): void {
        
        const { Effect, WindowEffect } = effect

        if(Effect){
            console.log('暫時沒有見過 所以不知道怎樣做!', Effect)
        }

        if(WindowEffect){
            switch (WindowEffect) {
                case WindowEffects.Sepia:
                    if(!this._sepiaEffectObject.visible){
                        this._sepiaEffectObject.visible = true;
                    }
                    break
                case WindowEffects.WhiteBlur:
                    if(!this._whiteBlurEffectObject.visible){
                        this._whiteBlurEffectObject.visible = true;
                        this._blur_filter.enabled = true;
                        // 問就是會lag
                        // this._whiteBlurEffectAnimation.start();
                        // 要用shader 但我不會
                        // 啊 shader不就是filter...
                    }
                    break
            }
        }
    }

    hideEffect(effect : IEpisodeEffect){
        if(!effect.WindowEffect){
            if(this._sepiaEffectObject.visible){
                this._sepiaEffectObject.visible = false;
            }

            if(this._whiteBlurEffectObject.visible){
                this._whiteBlurEffectObject.visible = false;
                this._blur_filter.enabled = false;
                this._whiteBlurEffectAnimation.stop();
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