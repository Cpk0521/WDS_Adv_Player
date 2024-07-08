import { Sprite, Assets } from "pixi.js";
import { Tween } from "tweedle.js";
import { IView } from "../types/View";
import { FadeTypes, IEpisodeBackground, IEpisodeFade } from "../types/Episode";
import SceneCameraList from "../constant/SceneCamera";
import createEmptySprite from "../utils/emptySprite";
import { AdvTimeElapsedAnimation } from "../object/advTimeElapsedAnimation";

type CameraEffect = {
  Id: number;
  StartPositionX: number;
  StartPositionY: number;
  StartZoomRatio: number;
  EndPositionX: number;
  EndPositionY: number;
  EndZoomRatio: number;
  CameraMoveTurnaroundTimeSeconds: number;
};

export class BackgroundView extends IView {
  protected readonly _whiteFadePanel: Sprite = createEmptySprite({ alpha: 0 });
  protected readonly _blackFadePanel: Sprite = createEmptySprite({
    color: 0x000000,
    alpha: 0,
  });
  protected readonly _advTimeElapsedAnimation: AdvTimeElapsedAnimation = AdvTimeElapsedAnimation.create();
  protected readonly _bgMap: Map<string, Sprite> = new Map();
  protected readonly _SceneCameraEffects = SceneCameraList;
  protected _currentBG: Sprite | undefined;
  protected _currentCardLabel: string = "";
  protected _currentCameraEffects: CameraEffect | undefined;
  protected _cuttentZoom: Tween<any> | undefined;

  constructor() {
    super();

    this.sortableChildren = true;

    this._whiteFadePanel.zIndex = 5;
    this.addChild(this._whiteFadePanel);

    this._blackFadePanel.zIndex = 5;
    this.addChild(this._blackFadePanel);

    this._advTimeElapsedAnimation.zIndex = 5;
    this.addChild(this._advTimeElapsedAnimation);
  }

  static new() {
    return new this();
  }

  public clear(): void {
    this._bgMap.clear();
    this._whiteFadePanel.alpha = 0;
    this._blackFadePanel.alpha = 0;
    this._advTimeElapsedAnimation.alpha = 0;
    this._currentBG && this.removeChild(this._currentBG);
  }

  execute({
    BackgroundImageFileName,
    BackgroundCharacterImageFileName,
    BackgroundImageFileFadeType,
    StillPhotoFileName,
    SceneCameraMasterId,
    FadeValue1 = 0,
    FadeValue2 = 0,
    FadeValue3 = 0,
  }: IEpisodeBackground & IEpisodeFade) {

    // 清除上次操作
    if (this._currentCameraEffects && this._cuttentZoom) {
      this._cuttentZoom.stop();
      this._cuttentZoom = undefined;
      this._currentBG?.position.set(
        1920 / 2 - (this._currentCameraEffects?.EndPositionX ?? 0),
        1080 / 2 - (this._currentCameraEffects?.EndPositionY ?? 0)
      );
      this._currentCameraEffects = undefined;
    }

    // 如果沒有就什麼都不做
    if (
      !BackgroundImageFileName &&
      !BackgroundCharacterImageFileName &&
      !StillPhotoFileName &&
      !BackgroundImageFileFadeType
    ) {
      return;
    }

    let fadein: Tween<any> | undefined;
    let newbg: Sprite | undefined;
    let totalDuration : number = 0;

    // 如果有 BackgroundImageFileName
    if (BackgroundImageFileName) {
      if (this._currentBG) {
        this._currentBG.zIndex = 0;
      }

      if (!this._bgMap.has(BackgroundImageFileName)) {
        newbg = new Sprite(Assets.get(`bg_${BackgroundImageFileName}`));
        newbg.anchor.set(0.5);
        newbg.scale.set(1.17);
        newbg.position.set(1920 / 2, 1080 / 2);
        this._bgMap.set(BackgroundImageFileName, newbg);
      }

      newbg = newbg || this._bgMap.get(BackgroundImageFileName)!;
      newbg.zIndex = 1;
      newbg.alpha = 0;
      this.addChild(newbg);
    }

    // 如果有 StillPhotoFileName
    if (StillPhotoFileName) {
      if (this._currentBG) {
        this._currentBG.zIndex = 0;
      }

      if (!this._bgMap.has(StillPhotoFileName)) {
        newbg = new Sprite(Assets.get(`still_${StillPhotoFileName}`));
        newbg.anchor.set(0.5);
        newbg.scale.set(1.17);
        newbg.position.set(1920 / 2, 1080 / 2);
        this._bgMap.set(StillPhotoFileName, newbg);
      }

      newbg = newbg || this._bgMap.get(StillPhotoFileName)!;
      newbg.zIndex = 1;
      newbg.alpha = 0;
      this.addChild(newbg);
    }

    // 如果有 BackgroundCharacterImageFileName
    if (
      BackgroundCharacterImageFileName &&
      BackgroundCharacterImageFileName != this._currentCardLabel
    ) {
      this._currentCardLabel = BackgroundCharacterImageFileName;
      if (this._currentBG) {
        this._currentBG.zIndex = 0;
      }

      if (!this._bgMap.has(BackgroundCharacterImageFileName)) {
        newbg = new Sprite(
          Assets.get(`card_${BackgroundCharacterImageFileName}`)
        );
        newbg.anchor.set(0.5);
        newbg.scale.set(1.17);
        newbg.position.set(1920 / 2, 1080 / 2);
        newbg.zIndex = 1;
        this._bgMap.set(BackgroundCharacterImageFileName, newbg);
      }

      newbg = newbg || this._bgMap.get(BackgroundCharacterImageFileName)!;
      newbg.alpha = 0;
      this.addChild(newbg);
    }

    //Zoom Animataion
    if (SceneCameraMasterId) {
      //未諗到點做
      this._currentCameraEffects = this._SceneCameraEffects.find(
        (e) => e.Id == SceneCameraMasterId
      );
      newbg?.scale.set(1.235); // 條數唔識計
      newbg?.position.set(
        1920 / 2 - (this._currentCameraEffects?.StartPositionX ?? 0),
        1080 / 2 - (this._currentCameraEffects?.StartPositionY ?? 0)
      );
      this._cuttentZoom = new Tween(newbg).to(
        {
          position: {
            x: 1920 / 2 - (this._currentCameraEffects?.EndPositionX ?? 0),
            y: 1080 / 2 - (this._currentCameraEffects?.EndPositionY ?? 0),
          },
          scale: 1.235, // 條數唔識計
        },
        this._currentCameraEffects?.CameraMoveTurnaroundTimeSeconds
      );
      totalDuration = this._currentCameraEffects?.CameraMoveTurnaroundTimeSeconds ?? 0;
    }

    // Fade Animation
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
          totalDuration = (FadeValue1 + FadeValue2 + FadeValue3) * 1000 + 2000;
          break;
        case FadeTypes.WhiteFadeOutFadeIn:
          fadein = new Tween(this._whiteFadePanel)
            .to({ alpha: 1 }, FadeValue1 * 1000 )
            .chain(
              new Tween(this._whiteFadePanel)
                .delay(FadeValue2 * 1000 + 1200)
                .to({ alpha: 0 }, FadeValue3 * 1000)
            );
          totalDuration = (FadeValue1 + FadeValue2 + FadeValue3) * 1000 + 2000;
          break;
        case FadeTypes.TimeElapsed:
          fadein = this._advTimeElapsedAnimation.FadeIn;
          totalDuration = this._advTimeElapsedAnimation.totalDuration + 200;
          break;
        case FadeTypes.CrossFade:
          fadein = new Tween(newbg).to({ alpha: 1 }, FadeValue1 * 1000);
          break;
      }
    }

    // run
    if (fadein) {
      fadein.start().onStart(() => {
        setTimeout(async () => {
          this._insertBG(newbg, this._cuttentZoom);
        }, totalDuration > 0 ? totalDuration/2.5 : (FadeValue1 * 1000));
      });

      return new Promise<void>((res, _) => {
        setTimeout(() => {
          res();
        }, totalDuration);
      });
    } 
    else {
      this._insertBG(newbg, this._cuttentZoom);
      return ;
    }
  }

  _insertBG(newbg?: Sprite, zoom?: Tween<any>) {
    if (zoom) {
      zoom.start().onComplete(() => {
        this._cuttentZoom = undefined;
        this._currentCameraEffects = undefined;
      });
    }

    if (newbg) {
      newbg.alpha = 1;
      this._currentBG && this.removeChild(this._currentBG);
      this._currentBG = newbg;
    }
  }

}
