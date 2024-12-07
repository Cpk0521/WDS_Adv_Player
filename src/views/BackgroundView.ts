import { Sprite, Assets } from "pixi.js";
import { Tween } from "tweedle.js";
import { IView, episodeExecutable } from "../types/View";
import { FadeTypes, IEpisodeBackground, IEpisodeFade } from "../types/Episode";
import SceneCameraList from "../constant/SceneCamera";

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

export class BackgroundView extends IView implements episodeExecutable{
  protected readonly _bgMap: Map<string, Sprite> = new Map();

  protected _currentBG: Sprite | undefined;
  protected _currentCard: Sprite | undefined;
  protected _currentCardLabel: string = "";
  protected _currentCameraEffects: CameraEffect | undefined;
  protected _cuttentZoom: Tween<any> | undefined;

  constructor() {
    super();

    this.sortableChildren = true;
  }

  static new() {
    return new this();
  }

  public clear(): void {
    this._bgMap.clear();
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
  }: IEpisodeBackground & IEpisodeFade) :  (() => Promise<void>) | undefined  {

    //清除之前的CameraEffect
    if (this._currentCameraEffects && this._cuttentZoom) {
      this._cuttentZoom.stop();
      this._currentBG?.position.set(
        1920 / 2 - (this._currentCameraEffects?.EndPositionX ?? 0),
        1080 / 2 - (this._currentCameraEffects?.EndPositionY ?? 0)
      );
      this._cuttentZoom = void 0;
      this._currentCameraEffects = void 0;
    }

    //如果都沒有
    if (
      !BackgroundImageFileName &&
      !BackgroundCharacterImageFileName &&
      !StillPhotoFileName
    ) {
      //清除之前的 BackgroundCharacterImageFileName
      this._characterImageControl();
      return;
    }
  
    let FadeDuration : number = 0;
    let ZoomDuration : number = 0;
    let newbg: Sprite | undefined ;

    // 如果有 BackgroundImageFileName
    if (BackgroundImageFileName) {
      if (this._currentBG) {
        this._currentBG.zIndex = 0;
      }
      
      if (!this._bgMap.has(BackgroundImageFileName)) {
        newbg = new Sprite(Assets.get(`bg_${BackgroundImageFileName}`));
        newbg.anchor.set(0.5);
        newbg.scale.set(1.17);
        newbg.position.set(1920/2, 1080/2);
        this._bgMap.set(BackgroundImageFileName, newbg);
      }

      newbg = newbg || this._bgMap.get(BackgroundImageFileName)!;
      
      if(newbg!= this._currentBG){
        newbg.zIndex = 1;
        newbg.alpha = 0;
        this.addChild(newbg);
      }
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

      if(newbg!= this._currentBG){
        newbg.zIndex = 1;
        newbg.alpha = 0;
        this.addChild(newbg);
      }
    }
    
    // 如果有SceneCameraEffect
    if (SceneCameraMasterId) {
      //未諗到點做
      this._currentCameraEffects = SceneCameraList.find((effect) => effect.Id == SceneCameraMasterId);
      newbg?.scale.set(0.007 * (this._currentCameraEffects?.StartZoomRatio || 160)); //條數唔識計
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
          scale: 1.17, //條數唔識計
        },
        this._currentCameraEffects?.CameraMoveTurnaroundTimeSeconds
      );
      ZoomDuration = this._currentCameraEffects?.CameraMoveTurnaroundTimeSeconds || 0
    }

    // 如果是Fade動畫
    if (BackgroundImageFileFadeType) {
      switch (BackgroundImageFileFadeType){
        case FadeTypes.CrossFade:
          if(newbg){
            new Tween(newbg).to({ alpha: 1 }, FadeValue1 * 1000).start();
          }
          FadeDuration = FadeValue1 * 1000;
          break;
        case FadeTypes.TimeElapsed:
          FadeDuration = 1000;
          break
        default:
          FadeDuration = FadeValue1 * 1000;
          break;
      }
    }

    //執行更換背景
    //如果有Fade效果 會等一段時間才更換背景 並等待動畫完成
    if(FadeDuration > 0){
      return () => {
        setTimeout(()=>{
          this._characterImageControl(BackgroundCharacterImageFileName);
          this._insertBG(newbg, this._cuttentZoom);
        }, FadeDuration);  
        
        return new Promise<void>((res, _) => {
          setTimeout(()=>{
            res();
          }, FadeDuration + 250);
        })
      }
    }
    
    //如果沒有Fade效果 但有zoomEffect 就直接更換背景 並等待動畫完成
    if(this._cuttentZoom){
      return () => {
        this._characterImageControl(BackgroundCharacterImageFileName); //正常來說這邊應該沒有 但為了避免bug所以還是加上
        this._insertBG(newbg, this._cuttentZoom);
        return new Promise<void>((res, _) => {
          setTimeout(()=>{
            res();
          }, ZoomDuration);
        })
      }
    }

    //什麼都沒有 就直接換
    this._characterImageControl(BackgroundCharacterImageFileName);
    this._insertBG(newbg, this._cuttentZoom);
    return;
  }

  _insertBG(newbg?: Sprite, zoom?: Tween<any>) {
    if (zoom) {
      zoom.start().onComplete(() => {
        this._cuttentZoom = void 0;
        this._currentCameraEffects = void 0;
      });
    }

    if (newbg && newbg != this._currentBG) {
      newbg.alpha = 1;
      this._currentBG && this.removeChild(this._currentBG);
      this._currentBG = newbg;
    }
  }

  _characterImageControl(BackgroundCharacterImageFileName? : string) {
    //清除之前的 BackgroundCharacterImageFileName
    if(!BackgroundCharacterImageFileName && this._currentCard){
      this.removeChild(this._currentCard);
      this._currentCard = void 0
    }

    // 如果有 BackgroundCharacterImageFileName
    if (BackgroundCharacterImageFileName && BackgroundCharacterImageFileName != this._currentCardLabel){
      let card;

      if (!this._bgMap.has(BackgroundCharacterImageFileName)){
        card = new Sprite(Assets.get(`card_${BackgroundCharacterImageFileName}`));
        card.anchor.set(0.5);
        card.scale.set(1.17);
        card.position.set(1920 / 2, 1080 / 2);
        card.zIndex = 2;
        this._bgMap.set(BackgroundCharacterImageFileName, card);
      }

      this._currentCard = card || this._bgMap.get(BackgroundCharacterImageFileName)!;
      this._currentCardLabel = BackgroundCharacterImageFileName;
      this.addChild(this._currentCard!);      
    }  
  }

}
