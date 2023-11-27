import { Container } from "@pixi/display";
import { Sprite } from "pixi.js";
import { IController, IView } from "../types/View";
import { IEpisodeDetail, WindowEffects } from "../types/Episode";

export class EffectView extends IView implements IController{
    public execute<T extends IEpisodeDetail>(arr: T) {
        throw new Error("Method not implemented.");
    }

    protected _sepiaEffect! : Sprite
    protected _whiteBlurEffect! : any
    protected currentEffect! : WindowEffects

    constructor(){
        super()
    }

    init(): void {
        throw new Error("Method not implemented.");
    }

    process(effect : WindowEffects): void {
        throw new Error("Method not implemented.");
    }

    ShowEffect() : Promise<any>{
        return Promise.resolve();
    }

    HideEffect() : Promise<any>{
        return Promise.resolve();
    }

}