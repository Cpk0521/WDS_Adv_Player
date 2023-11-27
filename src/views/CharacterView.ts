import { Container, Assets } from "pixi.js";
import { Spine, SkeletonData, TrackEntry } from '@pixi-spine/runtime-4.1';
import { IController, IView } from "../types/View";
import { CharacterAppearanceTypes, CharacterPositions, IEpisodeCharacter, IEpisodeDetailCharacterMotion } from "../types/Episode";
// constant
import LipSynParameters from "../constant/LipSync";
import BodyMotion from "../constant/BodyMotion";
import FacialExpression from "../constant/FacialExpression";
import HeadDirection from "../constant/HeadDirection";
import HeadMotion from "../constant/HeadMotion";


interface characterAnimation {
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
        this._model.scale.set(.75);
        this._model.state.setAnimation(0, "breath", true);
        // console.log('model', this._model.getBounds())
        this._model.y = 1080 / 2 - (-550);
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

        if(eyeAnimationName){
            const anim = this._model.state.setAnimation(3, eyeAnimationName, false);//true
            // if(eyeAnimationName !== this._motions.eyeAnimationName){
            //     console.log(eyeAnimationName);
            // }
        }

        if(eyeMotionName){
            if(eyeMotionName !== this._motions.eyeMotionName){
                const anim = this._model.state.setAnimation(4, eyeMotionName, false);
                anim.timeScale = 0;
            }
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


interface motionCharacterRecord {
    slotNumber : number;
    spineId : number;
    character : AdventureAnimationStandCharacter | undefined;
}


export class CharacterView extends IView implements IController{
    
    //constant
    protected readonly _lipMotionParameters = LipSynParameters;
    protected readonly _BodyMotions = BodyMotion;
    protected readonly _facialExpressions = FacialExpression;
    protected readonly _headMotions =  HeadMotion;
    protected readonly _headDirections = HeadDirection;

    protected readonly _standCharacters : Map<string, AdventureAnimationStandCharacter> = new Map(); //all
    protected _motionCharacters : motionCharacterRecord[] = []; //show on screen
    protected _prevCharacters : motionCharacterRecord[] = [];

    constructor(){
        super()

        this.sortableChildren = true;
    }

    addTo(parent : Container, order : number = 0): this {
        parent.addChild(this);
        this.zIndex = order;
        
        return this;
    }
    
    execute({ CharacterMotions }: IEpisodeCharacter) {
        if(CharacterMotions.length === 0){
            this._motionCharacters = [];
            this.hideAllCharacter();
            return;
        }

        this._prevCharacters = [...this._motionCharacters];
        this._motionCharacters = [];
        //find not need model
        const notneed = this._prevCharacters.filter(prev => !CharacterMotions.find(data => data.slotNumber === prev.slotNumber));
        notneed.forEach(char => char.character?.hideCharacter());

        CharacterMotions.forEach((motiondata : IEpisodeDetailCharacterMotion)=>{

            let model : AdventureAnimationStandCharacter | undefined = undefined;

            //如果SpineId = 0 就直接用上個stage的同樣slotNumber
            if(motiondata.SpineId === 0){
                model = this._prevCharacters.find((record) => record.slotNumber === motiondata.slotNumber)?.character;
            }
            else{
                if(!this._standCharacters.has(`${motiondata.SpineId}`)){
                    model = new AdventureAnimationStandCharacter(Assets.get(`spine_${motiondata.SpineId}`).spineData, motiondata.SpineId)
                    model.addTo(this);
                    this._standCharacters.set(`${motiondata.SpineId}`, model)
                }
                this._prevCharacters.find((record) => record.slotNumber === motiondata.slotNumber)?.character?.hideCharacter();
            }

            model = model ?? this._standCharacters.get(`${motiondata.SpineId}`);
            model?.changeSlotNumber(motiondata.slotNumber);
            model?.changePosition(motiondata.CharacterPosition);
            model?.setCharacterLayer(motiondata.CharacterLayerType);
            model?.showCharacter();

            let characterAnimation : Partial<characterAnimation> = {}

            if(motiondata.FacialExpressionMasterId){
                let expression = this._facialExpressions.find((exp) => exp.Id === motiondata.FacialExpressionMasterId)
                characterAnimation.eyebrowAnimationName = expression?.EyeBrow;
                characterAnimation.eyeMotionName = expression?.Eye;
                characterAnimation.eyeAnimationName = expression?.EyeBlink ?? undefined;
                characterAnimation.cheekAnimationName = expression?.Cheek;
                characterAnimation.mouthAnimationName = expression?.Mouth;
            }

            if(motiondata.HeadMotionMasterId){
                let headMotion = this._headMotions.find((head) => head.Id === motiondata.HeadMotionMasterId)
                characterAnimation.headMotionName = headMotion?.MotionName;
            }

            if(motiondata.HeadDirectionMasterId){
                let headDirection = this._headDirections.find((headdirection) => headdirection.Id === motiondata.HeadDirectionMasterId)
                characterAnimation.headAnimationName = headDirection?.DirectionName;
            }

            if(motiondata.BodyMotionMasterId){
                let bodyMotion = this._BodyMotions.find((bodymotion) => bodymotion.Id === motiondata.BodyMotionMasterId)
                characterAnimation.bodyAnimationName = bodyMotion?.MotionName;
            }

            if(motiondata.LipSyncMasterId){
                let lipSync = this._lipMotionParameters.find((lip) => lip.Id === motiondata.LipSyncMasterId)
                characterAnimation.mouthAnimationName = lipSync?.MotionName;
            }

            model?.SetAllAnimation(characterAnimation);

            this._motionCharacters.push({
                slotNumber : motiondata.slotNumber,
                spineId : motiondata.SpineId,
                character : model
            });

        })

    }

    hideCharacter() : void {
        this._motionCharacters.forEach(record => record.character?.hideCharacter());
    }

    hideAllCharacter() : void{
        Array.from(this._standCharacters).forEach(([_, char]) => char.hideCharacter())
    }

    destroySpine() : void{
        Object.values(this._standCharacters).forEach((char : AdventureAnimationStandCharacter) => char.destory())
        this._standCharacters.clear();
    }

    offAllLipSync() : void{
        this._motionCharacters.forEach(record => record.character?.offLipSync());
    }
    
}