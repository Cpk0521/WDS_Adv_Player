import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { IController, IView } from "../types/View";
import { FadeTypes, IEpisodeDetail } from "../types/Episode";
import { createEmptySprite } from "../utils/emptySprite";

export class FadeView extends IView implements IController{
    
    public execute<T extends IEpisodeDetail>(arr: T) {
        throw new Error("Method not implemented.");
    }
    
    protected _whiteFadePanel : Sprite = createEmptySprite({alpha: 0});
    protected _blackFadePanel : Sprite = createEmptySprite({color: 0xFFFFFF, alpha: 0});

    init(): void {
        throw new Error("Method not implemented.");
    }

    process(FadeType: FadeTypes): void {

        switch (FadeType) {
            case FadeTypes.BlackFadeOutFadeIn:
                break;
            case FadeTypes.WhiteFadeOutFadeIn:
                break;
            case FadeTypes.CrossFade:
                break;
            case FadeTypes.TimeElapsed:
                break;
        }
    }

    ShowFade() : Promise<any>{
        return Promise.resolve();
    }

    HideFade() : Promise<any>{
        return Promise.resolve();
    }

}