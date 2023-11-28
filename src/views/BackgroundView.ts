import { Sprite, Texture, Assets, AlphaFilter, Graphics} from "pixi.js";
import { Tween } from "tweedle.js";
import '@pixi-spine/loader-uni';
import { Spine } from '@pixi-spine/runtime-4.1';
import { IController, IView } from "../types/View";
import { FadeTypes, IEpisodeBackground, IEpisodeFade } from "../types/Episode";
import SceneCameraList from "../constant/SceneCamera";
import createEmptySprite from "../utils/emptySprite";
import { baseAssets } from "../constant/advConstant";


class Jugon_Fade extends Graphics{

    protected _jugon : Spine | undefined;
    protected aplha_filter = new AlphaFilter();

    constructor(){
        super();
        // this.width = 1920;
        // this.height = 1080;
        // this.anchor.set(.5);
        // this.position.set(1920/2, 1080/2);
        this.beginFill(0xffffff);
        this.drawRect(0, 0, 1920, 1080);
        this.alpha = 0;

        Assets.load(baseAssets.jugon_progress).then((asset)=>{
            this._jugon = new Spine(asset.spineData);
            this.addChild(this._jugon);
            this._jugon.visible = false;
            this._jugon.scale.set(.25);
            let jugon_height = this._jugon.getBounds().height;
            this._jugon.position.set(1920 / 2, 1080 / 2 + (jugon_height/2));
            this._jugon.filters = [this.aplha_filter];
            this._jugon.state.addListener({
                complete :() => this._hide(),
            })
        })
    }

    static create(){
        return new this();
    }


    get FadeIn(){
        return new Tween(this).to({alpha : 1}, 800).onComplete(()=>{
            this._jugon!.visible = true;
            this._jugon!.state.setAnimation(0, "animation", false); 
        })
    }

    _hide(){
        let jugonhide =  new Tween(this.aplha_filter).to({alpha : 0}, 800).start();
        jugonhide.chain(
            new Tween(this)
                .to({alpha : 0}, 800)
                .delay(1200)
                .onComplete(()=>{
                    this._jugon!.visible = false;
                })
                .start())
    }
}

export class BackgroundView extends IView implements IController{
    
    protected readonly _whiteFadePanel : Sprite = createEmptySprite({alpha: 0});
    protected readonly _blackFadePanel : Sprite = createEmptySprite({color: 0x000000, alpha: 0});
    protected readonly _jugonFadePanel : Jugon_Fade = Jugon_Fade.create();
    protected readonly _bgMap : Map<string, Sprite> = new Map();
    protected readonly _SceneCameraEffects = SceneCameraList;
    protected _currentBG : Sprite | undefined;

    constructor(){
        super();

        this.sortableChildren = true;

        this._whiteFadePanel.zIndex = 5;
        this.addChild(this._whiteFadePanel);

        this._blackFadePanel.zIndex = 5;
        this.addChild(this._blackFadePanel);

        this._jugonFadePanel.zIndex = 5;
        this.addChild(this._jugonFadePanel);
    }

    static new(){
        return new this();
    }
    
    execute({
        BackgroundImageFileName,
        BackgroundCharacterImageFileName,
        BackgroundImageFileFadeType,
        StillPhotoFileName,
        SceneCameraMasterId,
        FadeValue1,
        FadeValue2,
        FadeValue3,
    } : IEpisodeBackground & IEpisodeFade){

        if(!BackgroundImageFileName && !BackgroundCharacterImageFileName && !StillPhotoFileName){
            return;
        }

        let fadein : Tween<any> | undefined
        let fadeout : Tween<any> | undefined
        let newbg : Sprite | undefined = undefined;
            
        // 如果有 BackgroundImageFileName
        if(BackgroundImageFileName){
            if(this._currentBG){
                this._currentBG.zIndex = 0
            }
    
            if(!this._bgMap.has(BackgroundImageFileName)){
                newbg = new Sprite(Assets.get(`bg_${BackgroundImageFileName}`));
                newbg.anchor.set(0.5);
                newbg.scale.set(1.17);
                newbg.position.set(1920/2, 1080/2);
                this._bgMap.set(BackgroundImageFileName, newbg);
            }
    
            newbg = newbg ?? this._bgMap.get(BackgroundImageFileName);
            newbg!.zIndex = 1;
            newbg!.alpha = 0;
            this.addChild(newbg!);
        }
        
        // 如果有 StillPhotoFileName
        if(StillPhotoFileName){
            if(this._currentBG){
                this._currentBG.zIndex = 0
            }

            if(!this._bgMap.has(StillPhotoFileName)){
                newbg = new Sprite(Assets.get(`still_${StillPhotoFileName}`));
                newbg.anchor.set(0.5);
                newbg.scale.set(1.17);
                newbg.position.set(1920/2, 1080/2);
                this._bgMap.set(StillPhotoFileName, newbg);
            }

            newbg = newbg ?? this._bgMap.get(StillPhotoFileName);
            newbg!.zIndex = 1;
            newbg!.alpha = 0;
            this.addChild(newbg!);
        }

        // Fade Animation
        if(BackgroundImageFileFadeType){
            switch (BackgroundImageFileFadeType) {
                case FadeTypes.BlackFadeOutFadeIn:
                    fadein = new Tween(this._blackFadePanel).to({alpha: 1}, FadeValue1! * 1000);
                    fadeout = new Tween(this._blackFadePanel).to({alpha: 0}, FadeValue3! * 1000).delay(FadeValue2! * 1000);
                    fadein.chain(fadeout);
                    break;
                case FadeTypes.WhiteFadeOutFadeIn:
                    fadein = new Tween(this._whiteFadePanel).to({alpha: 1}, FadeValue1! * 1000);
                    fadeout = new Tween(this._whiteFadePanel).to({alpha: 0}, FadeValue3! * 1000).delay(FadeValue2! * 1000);
                    fadein.chain(fadeout);
                    break;
                case FadeTypes.TimeElapsed:
                    fadein = this._jugonFadePanel.FadeIn;
                    break;
                case FadeTypes.CrossFade:
                    fadein = new Tween(newbg).to({alpha: 1}, FadeValue1! * 1000);
                    break;
            }
        }
     
        if(SceneCameraMasterId){
            //未諗到點做
            let sceneCameraEffect = this._SceneCameraEffects.find(e => e.Id == SceneCameraMasterId)
            console.log(sceneCameraEffect)
        }

        // run
        if(fadein){
            fadein.start().onStart(()=>{
                setTimeout(()=>{
                    newbg!.alpha = 1;
                    this._currentBG && this.removeChild(this._currentBG);
                    this._currentBG = newbg;
                }, 1000)
            })

            return new Promise<void>((res, _) => {
                setTimeout(()=>{
                    res()
                }, ((FadeValue1 ?? 0) + (FadeValue2 ?? 0) + (FadeValue3 ?? 0)) * 1000)
            })
        }
        else{
            newbg!.alpha = 1;
            this._currentBG && this.removeChild(this._currentBG);
            this._currentBG = newbg;
        }
        
    }

}
