import { Container } from "pixi.js";
import { Spine, SkeletonData, TrackEntry } from '@pixi-spine/runtime-4.1';
import { CharacterAppearanceTypes, CharacterPositions } from "../types/Episode";
import LoopMotion from "../constant/LoopMotion";

export interface characterAnimation {
    bodyAnimationName : string,
    eyebrowAnimationName : string,
    eyeAnimationName : string,
    mouthAnimationName : string,
    headAnimationName : string,
    cheekAnimationName : string,
    headMotionName : string,
    eyeMotionName : string,
}

export class AdventureAnimationStandCharacter {

    protected _model : Spine;
    protected _spineId : number | undefined;
    protected _charId : string = '';
    protected _slotNumber : number = 0;
    protected _characterPosition : CharacterPositions = CharacterPositions.None;
    protected _appearanceType : CharacterAppearanceTypes = CharacterAppearanceTypes.FadeIn
    protected _breathTrack : TrackEntry | undefined = undefined;
    protected _lipTrack : TrackEntry | undefined = undefined;
    protected _motions : Partial<characterAnimation> = {}

    constructor(skeletonData : SkeletonData, spineId : number) {
        this._spineId = spineId;
        this._charId = `${this._spineId}`.slice(0, 3);
        //create spine model
        this._model = new Spine(skeletonData);
        this._model.name = this._charId;
        let loopMotion = LoopMotion.find((lm) => lm.TargetCharacterBaseId === this._charId);
        // clac the y position
        switch(loopMotion?.Size ?? 0){
            case 1:
                this._model.scale.set(0.77);
                this._model.y = 1000;
                break;
            case 2:
                this._model.scale.set(0.79);
                this._model.y = (1080 + ((158 - loopMotion!.Height) * 9)) || 1080;
                break;
            default:
                this._model.scale.set(0.79);
                this._model.y = 1080;
                break;
        }
    }

    addTo<T extends Container>(parent : T, order: number = 0){
        parent.addChild(this._model);
        this._model.zIndex = order;
    }

    changeSlotNumber(slotNumber : number){
        this._slotNumber = slotNumber;
    }

    changePosition(position : CharacterPositions){
        switch(position){
            case CharacterPositions.Center:
                this._model.x = 1920/2;
                this._model.zIndex = 0;
                break;
            case CharacterPositions.InnerLeft:
                this._model.x = 1920/2 - 320;
                this._model.zIndex = 1
                break;
            case CharacterPositions.InnerRight:
                this._model.x = 1920/2 + 320;
                this._model.zIndex = -1
                break;
            case CharacterPositions.OuterLeft:
                this._model.x = 1920/2 - 495;
                this._model.zIndex = 1
                break;
            case CharacterPositions.OuterRight:
                this._model.x = 1920/2 + 495;
                this._model.zIndex = -1
                break;
            default:
                this._model.x = 1920/2;
                break;
        }
    }

    setScale(size : number = 0.75){
        this._model.scale.set(size);
    }

    setCharacterLayer(layer : number){
        this._model.zIndex = layer;
    }
    
    SetAllAnimation(
        characterAnimation : Partial<characterAnimation>,
        loopMotionSpeed : number = 1,
    ){
        const { 
            bodyAnimationName, 
            eyebrowAnimationName, 
            eyeAnimationName, 
            eyeMotionName, 
            mouthAnimationName, 
            cheekAnimationName, 
            headAnimationName, 
            headMotionName 
        } = characterAnimation

        //重新呼吸
        this._breathTrack = this._model.state.setAnimation(0, "breath", true);

        if(bodyAnimationName){    
            this._model.state.setAnimation(1, bodyAnimationName, false);
        }

        if(eyebrowAnimationName){
            if(eyebrowAnimationName !== this._motions.eyebrowAnimationName){
                const anim = this._model.state.setAnimation(2, eyebrowAnimationName, false);
                anim.timeScale = 0;
            }
        }

        if(eyeMotionName){
            const anim = this._model.state.setAnimation(3, eyeMotionName, false);
            anim.trackTime = 1;
        }

        if(eyeAnimationName){
            //眨眼 -> 停一會 -> 眨眼  待解決!!!!!!!!!!!!
            let anim = this._model.state.setAnimation(3, eyeAnimationName, false);//true
        }

        if(mouthAnimationName){
            this._lipTrack = this._model.state.setAnimation(5, mouthAnimationName, true);
        }

        if(cheekAnimationName){
            this._model.state.setAnimation(6, cheekAnimationName, true);
        }

        if(headAnimationName){
            this._model.state.setAnimation(7, headAnimationName, false);
        }

        if(headMotionName){
            this._model.state.setAnimation(8, headMotionName, false);
        }

        this._motions = characterAnimation
    }

    onLipSync() : void{
        if(this._lipTrack){
            this._lipTrack.loop = true;
        }
    }

    offLipSync() : void{
        if(this._lipTrack){
            this._lipTrack.loop = false;
            this._lipTrack.timeScale = 0;
            this._lipTrack.trackTime = 0;
        }
    }

    hideCharacter(){
        //要停止呼吸
        if(this._breathTrack){
            this._breathTrack.loop = false;
            this._breathTrack.timeScale = 0;
            this._breathTrack.trackTime = 0;
        }
        this._model.visible = false;
    }

    showCharacter(){
        this._model.visible = true;
    }

    destory(){
        this._model.destroy();
    }

    get slotNumber(){
        return this._slotNumber;
    }

    get spineId(){
        return this._spineId;
    }

}
