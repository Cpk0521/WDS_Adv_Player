import { Container } from "pixi.js";
import { Spine, SkeletonData, TrackEntry } from '@pixi-spine/runtime-4.1';
import { CharacterAppearanceTypes, CharacterPositions } from "../types/Episode";

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
    protected _slotNumber : number = 0;
    protected _characterPosition : CharacterPositions = CharacterPositions.None;
    protected _appearanceType : CharacterAppearanceTypes = CharacterAppearanceTypes.FadeIn
    protected _lipTrack : TrackEntry | undefined = undefined;
    protected _motions : Partial<characterAnimation> = {}

    constructor(skeletonData : SkeletonData, spineId : number) {
        this._spineId = spineId;
        this._model = new Spine(skeletonData);
        // i don't know hot to clac the y position
        if(this._model.getBounds().height < 2400){
            this._model.y = 980; //1080 / 2 - (-480 + 55)
        }
        else{
            this._model.y = 1080 / 2 - (-550); //1090 
        }
        this._model.scale.set(0.75);
        this._model.state.setAnimation(0, "breath", true);
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
                break;
            case CharacterPositions.InnerLeft:
                this._model.x = 1920/2 - 320;
                break;
            case CharacterPositions.InnerRight:
                this._model.x = 1920/2 + 320;
                break;
            case CharacterPositions.OuterLeft:
                this._model.x = 1920/2 - 320*2;
                break;
            case CharacterPositions.OuterRight:
                this._model.x = 1920/2 + 320*2;
                break;
            default:
                this._model.x = 1920/2;
                break;
        }
    }

    setScale(size : number = 0.75){
        this._model.scale.set(size);
    }

    setCharacterLayer(order : number){
        this._model.zIndex = order - 1;
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
            let anim = this._model.state.setAnimation(3, eyeAnimationName, false);//true
            // anim.timeScale = 0.7;
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