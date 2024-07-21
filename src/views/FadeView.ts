import { Sprite, Assets } from "pixi.js";
import { Tween } from "tweedle.js";
import { IView } from "../types/View";
import { FadeTypes, IEpisodeFade } from "../types/Episode";
import createEmptySprite from "../utils/emptySprite";
import { AdvTimeElapsedAnimation } from "../object/advTimeElapsedAnimation";

export class FadeView extends IView {

    protected readonly _whiteFadePanel: Sprite = createEmptySprite({ alpha: 0 });
    protected readonly _blackFadePanel: Sprite = createEmptySprite({
        color: 0x000000,
        alpha: 0,
    });
    protected readonly _advTimeElapsed: AdvTimeElapsedAnimation = AdvTimeElapsedAnimation.create();
    // protected _delayTime = 0;
    protected _totalDuration = 0;

    constructor(){
        super();
        
        this.sortableChildren = true;

        this._whiteFadePanel.zIndex = 5;
        this.addChild(this._whiteFadePanel);

        this._blackFadePanel.zIndex = 5;
        this.addChild(this._blackFadePanel);

        this._advTimeElapsed.zIndex = 5;
        this.addChild(this._advTimeElapsed);
    }

    public clear(): void {
        this._whiteFadePanel.alpha = 0;
        this._blackFadePanel.alpha = 0;
        this._advTimeElapsed.alpha = 0;
    }

    execute({
        BackgroundImageFileFadeType,
        FadeValue1 = 0,
        FadeValue2 = 0,
        FadeValue3 = 0,
    }: IEpisodeFade) {
      let fadein: Tween<any> | undefined;
      
      if (BackgroundImageFileFadeType) {
        switch (BackgroundImageFileFadeType) {

          case FadeTypes.BlackFadeOutFadeIn:
            fadein = new Tween(this._blackFadePanel)
              .to( { alpha: 1 }, FadeValue1 * 1000 )
              .chain(
                new Tween(this._blackFadePanel)
                  .delay(FadeValue2 * 1000 + 1200)
                  .to({ alpha: 0 }, FadeValue3 * 1000)
              )
            this._totalDuration = (FadeValue1 + FadeValue2 + FadeValue3) * 1000 + 2000;
            break;

          case FadeTypes.WhiteFadeOutFadeIn:
            fadein = new Tween(this._whiteFadePanel)
              .to({ alpha: 1 }, FadeValue1 * 1000 )
              .chain(
                new Tween(this._whiteFadePanel)
                  .delay(FadeValue2 * 1000 + 1200)
                  .to({ alpha: 0 }, FadeValue3 * 1000)
              );
              this._totalDuration = (FadeValue1 + FadeValue2 + FadeValue3) * 1000 + 2000;
            break;

          case FadeTypes.TimeElapsed:
            fadein = this._advTimeElapsed.FadeIn;
            this._totalDuration = this._advTimeElapsed.totalDuration + 200;
            break;
        }
      }

      if(fadein){
        fadein.start();
        return new Promise<void>((res, _)=>{
          setTimeout(()=>{
            res();
          }, this._totalDuration)
        })
      }
      else{
        return;
      }
    }
}

// ------------|--------------------|------------
//    Value1   |       Value2       |   Value3

// 等 Value1 入 fade?
// Value2 < 0 ? 1 - Value2 : Value2
// 出 fade 等 Value3 到下一個unit?