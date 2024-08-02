import { Container } from "pixi.js";
import { Spine, SkeletonData } from '@pixi-spine/runtime-4.1';
import { CharacterAppearanceTypes, CharacterPositions } from "../types/Episode";
import LoopMotion from "../constant/LoopMotion";
import ChangeBodyMotion from "../constant/ChangeBodyMotion";

export interface characterAnimation {
    bodyAnimationName : string,
    eyebrowAnimationName : string, //EyeBrow
    eyeMotionName : string, //Eye
    eyeAnimationName : string, //EyeBlink
    mouthAnimationName : string,
    headAnimationName : string,
    cheekAnimationName : string,
    headMotionName : string,
}

export interface ILoopMotion {
    Id: number;
    TargetCharacterBaseId: string;
    LoopSpeed: number;
    Height: number;
    Size: number; // 1 | 2
}

export class AdventureAnimationStandCharacter {

    protected _model : Spine;
    protected _spineId : number | undefined;
    protected _charId : string = '';
    protected _slotNumber : number = 0;
    protected _characterPosition : CharacterPositions = CharacterPositions.None;
    protected _appearanceType : CharacterAppearanceTypes = CharacterAppearanceTypes.FadeIn
    protected _motions : Partial<characterAnimation> = {}
    protected _loopMotionData: ILoopMotion | undefined
    protected _eyeBlinkTimeout : number | NodeJS.Timeout | undefined;

    constructor(skeletonData : SkeletonData, spineId : number) {
        this._spineId = spineId;
        this._charId = `${this._spineId}`.slice(0, 3);
        //create spine model
        this._model = new Spine(skeletonData);
        this._model.name = this._charId;
        this._loopMotionData = LoopMotion.find((lm) => lm.TargetCharacterBaseId === this._charId);
        this._model.state.setAnimation(0, "breath", true);
        this._model.state.tracks[0].timeScale = this._loopMotionData?.LoopSpeed || 1;
        // clac the y position
        switch(this._loopMotionData?.Size || 2){
            case 1:
                this._model.scale.set(0.77);
                this._model.y = 1000;
                break;
            case 2:
                this._model.scale.set(0.79);
                this._model.y = (1080 + ((158 - this._loopMotionData!.Height) * 9)) || 1080;
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
        loopMotionSpeed : number = this._loopMotionData?.LoopSpeed || 1,
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
            let motion = ChangeBodyMotion.find(({BeforeMotionName, AfterMotionName}) => BeforeMotionName == this._motions.bodyAnimationName && AfterMotionName == bodyAnimationName);
            let entry = this._model.state.setAnimation(1, bodyAnimationName, false);
            entry.mixDuration = motion ? motion.Second : 0;
        }

        if(eyebrowAnimationName && eyebrowAnimationName !== this._motions.eyebrowAnimationName){
            const anim = this._model.state.setAnimation(2, eyebrowAnimationName, false);
            anim.timeScale = 0;
        }

        if(eyeMotionName){
            const anim = this._model.state.setAnimation(3, eyeMotionName, false);
            anim.trackTime = 1;
        }
        
        clearTimeout(this._eyeBlinkTimeout);
        if(eyeAnimationName){
            this._eyeBlinkAnimation(4, eyeAnimationName, 3.2);
        }

        if(eyeMotionName && !eyeAnimationName){
            this._model.state.setEmptyAnimation(4);
        }
        
        if(mouthAnimationName){
            this._model.state.setAnimation(5, mouthAnimationName, true);
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

        this._motions = characterAnimation;
    }

    _eyeBlinkAnimation(trackIndex: number, animationName: string, time : number = 1){
        this._model.state.setAnimation(trackIndex, animationName, false);
        this._model.state.tracks[trackIndex].listener = {
            complete : () => {
                this._eyeBlinkTimeout = setTimeout(()=>{
                    this._eyeBlinkAnimation(trackIndex, animationName, time);
                }, time * 1000)
            }
        }
    }

    onLipSync() : void{
        if(this._model.state.tracks[5]){
            this._model.state.tracks[5].loop = true;
        }
    }

    offLipSync() : void{
        let lipTrack = this._model.state.tracks[5];
        if(lipTrack){
            lipTrack.loop = false;
            lipTrack.timeScale = 0;
            lipTrack.trackTime = 0;
        }
    }

    hideCharacter(){
        //還原bodyAnimation + 要停止update
        clearTimeout(this._eyeBlinkTimeout);
        const clearTrack =  this._model.state.setEmptyAnimation(1);
        clearTrack.listener = {
            complete: () => {
                if(this._model.visible){
                    this._model.autoUpdate = false;
                    this._model.visible = false;
                }
            }
        }
    }

    showCharacter(){
        this._model.autoUpdate = true;
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
