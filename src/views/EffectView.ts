import { Container } from "@pixi/display";
import { Sprite } from "pixi.js";
import { IController, IView } from "../types/View";
import { IEpisodeEffect, WindowEffects } from "../types/Episode";

export class EffectView extends IView implements IController{


    protected _sepiaEffect! : Sprite
    protected _whiteBlurEffect! : any
    protected currentEffect! : WindowEffects

    constructor(){
        super()
    }

    execute(effect : IEpisodeEffect): void {
        throw new Error("Method not implemented.");
    }

    showEffect() : Promise<any>{
        return Promise.resolve();
    }

    hideEffect() : Promise<any>{
        return Promise.resolve();
    }

}