// import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { IController, IView } from "../types/View";
import { Assets } from "@pixi/assets";
import { FadeTypes, IEpisodeBackground, IEpisodeFade } from "../types/Episode";
import SceneCameraList from "../constant/SceneCamera";
import createEmptySprite from "../utils/emptySprite";
import { Tween } from "tweedle.js";

export class BackgroundView extends IView implements IController{
    
    protected readonly _whiteFadePanel : Sprite = createEmptySprite({alpha: 0});
    protected readonly _blackFadePanel : Sprite = createEmptySprite({color: 0x000000, alpha: 0});
    protected readonly _bgMap : Map<string, Sprite> = new Map();
    protected readonly _SceneCameraEffects = SceneCameraList;
    protected _whiteFadeTween : Tween<Sprite> = new Tween(this._whiteFadePanel);
    protected _blackFadeTween : Tween<Sprite> = new Tween(this._blackFadePanel);
    protected _currentBG : Sprite | undefined;

    constructor(){
        super();

        this.sortableChildren = true;

        this._whiteFadePanel.zIndex = 5;
        this.addChild(this._whiteFadePanel);

        this._blackFadePanel.zIndex = 5;
        this.addChild(this._blackFadePanel);
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

        let bg : Sprite | undefined = undefined;

        if(BackgroundImageFileName){
            if(this._currentBG){
                this._currentBG.zIndex = 0
            }
    
            if(!this._bgMap.has(BackgroundImageFileName)){
                bg = new Sprite(Assets.get(`bg_${BackgroundImageFileName}`));
                bg.anchor.set(0.5);
                bg.scale.set(1.17);
                bg.position.set(1920/2, 1080/2);
                this._bgMap.set(BackgroundImageFileName, bg);
            }
    
            bg = bg ?? this._bgMap.get(BackgroundImageFileName);
            bg!.zIndex = 1;
            this.addChild(bg!);
        }
        
        if(StillPhotoFileName){
            if(this._currentBG){
                this._currentBG.zIndex = 0
            }

            if(!this._bgMap.has(StillPhotoFileName)){
                bg = new Sprite(Assets.get(`still_${StillPhotoFileName}`));
                bg.anchor.set(0.5);
                bg.scale.set(1.17);
                bg.position.set(1920/2, 1080/2);
                this._bgMap.set(StillPhotoFileName, bg);
            }

            bg = bg ?? this._bgMap.get(StillPhotoFileName);
            bg!.zIndex = 1;
            this.addChild(bg!);
        }

        if(BackgroundImageFileFadeType){
            switch (BackgroundImageFileFadeType) {
                case FadeTypes.BlackFadeOutFadeIn:
                    break;
                case FadeTypes.WhiteFadeOutFadeIn:
                    break;
                case FadeTypes.TimeElapsed:
                    break;
                case FadeTypes.CrossFade:
                    //what's wrong
                    // this._blackFadeTween.to({alpha: 1}, 800)
                    // .onComplete(()=>{
                    //     setTimeout(()=>{
                    //         this._blackFadeTween.to({alpha: 0}, 800).start();
                    //     }, 3000)
                    // })
                    // .start();
                    break;
            }
        }

        if(SceneCameraMasterId){
            //未諗到點做
            let sceneCameraEffect = this._SceneCameraEffects.find(e => e.Id == SceneCameraMasterId)
        }
       
    }
    
}