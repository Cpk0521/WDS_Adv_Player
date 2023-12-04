import { Container, Assets } from "pixi.js";
import { IViewController, IView } from "../types/View";
import { IEpisodeCharacter, IEpisodeDetailCharacterMotion } from "../types/Episode";
import { characterAnimation, AdventureAnimationStandCharacter } from '../object/characterSpineModel'
// constant
import LipSynParameters from "../constant/LipSync";
import BodyMotion from "../constant/BodyMotion";
import FacialExpression from "../constant/FacialExpression";
import HeadDirection from "../constant/HeadDirection";
import HeadMotion from "../constant/HeadMotion";

interface motionCharacterRecord {
    slotNumber : number;
    spineId : number;
    character : AdventureAnimationStandCharacter | undefined;
}

export class CharacterView extends IView implements IViewController{
    
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

        this.offAllLipSync();
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
            model?.showCharacter();            

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