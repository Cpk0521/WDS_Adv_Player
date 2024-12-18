import { Sprite } from "pixi.js";
import { Tween } from "tweedle.js";
import { episodeExecutable, IView } from "../types/View";
import { FadeTypes, IEpisodeFade } from "../types/Episode";
import createEmptySprite from "../utils/emptySprite";
import { AdvTimeElapsedAnimation } from "../object/advTimeElapsedAnimation";

export class FadeView extends IView implements episodeExecutable{

    protected readonly _whiteFadePanel: Sprite = createEmptySprite({ alpha: 0 });
    protected readonly _blackFadePanel: Sprite = createEmptySprite({
        color: 0x000000,
        alpha: 0,
    });
    protected readonly _advTimeElapsed: AdvTimeElapsedAnimation = AdvTimeElapsedAnimation.create();
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
    }: IEpisodeFade) : (() => Promise<void>) | undefined {
      let fadein: Tween<any> | undefined;
      
      if (BackgroundImageFileFadeType) {
        switch (BackgroundImageFileFadeType) {

          case FadeTypes.BlackFadeOutFadeIn:
            fadein = new Tween(this._blackFadePanel)
              .to( { alpha: 1 }, FadeValue1 * 1000 )
              .chain(
                new Tween(this._blackFadePanel)
                  .delay(2000 + FadeValue2 * 1000)
                  .to({ alpha: 0 }, FadeValue3 * 1000)
              )
            this._totalDuration = (FadeValue1 * 1000) + (2000 + (FadeValue2 * 1000)) + (FadeValue3 * 1000);
            break;

          case FadeTypes.WhiteFadeOutFadeIn:
            fadein = new Tween(this._whiteFadePanel)
              .to({ alpha: 1 }, FadeValue1 * 1000 )
              .chain(
                new Tween(this._whiteFadePanel)
                  .delay(2000 + FadeValue2 * 1000)
                  .to({ alpha: 0 }, FadeValue3 * 1000)
              );
              this._totalDuration = (FadeValue1 * 1000) + (2000 + (FadeValue2 * 1000)) + (FadeValue3 * 1000);
            break;

          case FadeTypes.TimeElapsed:
            fadein = this._advTimeElapsed.FadeIn;
            this._totalDuration = this._advTimeElapsed.totalDuration + 200;
            break;
        }
      }

      if(fadein){
        return () => {
          fadein.start(); //
          return new Promise<void>((res, _)=>{
            setTimeout(()=>{
              res();
            }, this._totalDuration + 200)
          })
        }
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