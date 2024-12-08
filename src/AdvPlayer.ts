import { Container, FederatedPointerEvent, Ticker, Sprite, Assets } from "pixi.js";
//type
import { IEpisodeModel } from "./types/Episode";
//views
import { BackgroundView } from "./views/BackgroundView";
import { CharacterView } from "./views/CharacterView";
import { EffectView } from "./views/EffectView";
import { MovieView } from "./views/MovieView";
import { TextView } from "./views/TextView";
import { FadeView } from "./views/FadeView";
// import { HistoryView } from "./views/HistoryView";
import { UIView } from "./views/UIView";
//
import { CoverOpening } from "./object/coverOpening";
//manager
import { SoundController } from "./controller/soundController";
import { TranslationController } from "./controller/translationController";
//constant
import { baseAssets, Layer, TLFonts } from "./constant/advConstant";
//utils
import { checkImplements, isURL } from "./utils/check";
import { createEmptySprite } from "./utils/emptySprite";
import { resPath } from "./utils/resPath";
import { loadJson, loadResourcesFromEpisode, loadPlayerAssetsBundle } from './utils/loadResources'
import { banner, TrackLog } from "./utils/logger";

export class AdvPlayer extends Container<any> {
  //init
  protected _inited : boolean = false;
  protected _loadPromise: Promise<any> | undefined;
  //View
  protected _backgroundView!: BackgroundView;
  protected _characterView!: CharacterView;
  protected _effectView!: EffectView;
  protected _textView!: TextView;
  protected _movieView!: MovieView;
  protected _fadeView! : FadeView;
  // protected _historyView: HistoryView;
  protected _uiView!: UIView;
  protected _coverOpening!: CoverOpening;
  // Controller
  protected _soundController: SoundController = new SoundController();
  protected _translationController: TranslationController = new TranslationController();
  //episode Info
  protected _episode: IEpisodeModel | undefined;
  protected _currentIndex: number = 0;
  protected _currentGroupOrder: number = 0;
  protected _isAuto: boolean = false;
  protected _isVoice: boolean = true;
  protected _isAdventureEnded: boolean = false;
  // protected _processing: Promise<any>[] = [];
  protected _processing: (()=>Promise<any>)[] = [];
  protected _trackPromise: Promise<boolean> | undefined;

  protected _handleVisibilityChange = this._onBlur.bind(this);

  constructor() {
    super();

    //advPlayer setting
    this.addChild(createEmptySprite({ empty : true, color: 0x000000 }));
    this.sortableChildren = true;
    this.eventMode = "static";
    document.addEventListener("visibilitychange", this._handleVisibilityChange);

    //log
    banner();
  }

  public static create() {
    return new this();
  }

  public async init(){
    await loadPlayerAssetsBundle('baseAssets', baseAssets);

    //views
    this._uiView = new UIView().addTo(this, Layer.UILayer);
    // // this._historyView = new HistoryView().addTo(this, Layer.HistroyLayer);
    this._fadeView = new FadeView().addTo(this, Layer.FadeLayer);
    this._movieView = new MovieView().addTo(this, Layer.MovieLayer);
    this._textView = new TextView().addTo(this, Layer.TextLayer);
    this._effectView = new EffectView().addTo(this, Layer.EffectLayer);
    // this._characterView = new CharacterView().addTo(this._effectView, Layer.CharacterLayer);
    this._backgroundView = new BackgroundView().addTo(this._effectView, Layer.BackgroundLayer);

    //Cover
    this._coverOpening = CoverOpening.new().addTo(this, Layer.CoverLayer);

    // //ui button setting
    this._uiView.AutoBtn.addclickFun(() => {
      this._isAuto = this._uiView!.AutoBtn.Pressed;
      if(this._trackPromise && this._isAuto){
        this._trackPromise = this._trackPromise.then((
          previous_then_not_execute : boolean
        )=>{
          if(!this._isAuto){ //如果不是在auto下就返回
            return true; // 返回未播放信息
          }
          if(previous_then_not_execute){ //如果未播放過
            this._trackPromise = void 0; //清除Promise
            this._renderFrame(); //播放
          }
          return false; // 返回已播放了信息
        })
      }
    });

    this._inited = true;
  }

  public addTo<C extends Container>(parent: C): AdvPlayer {
    parent.addChild(this);
    return this;
  }

  public async clear() {
    await Assets.unloadBundle(`${this._episode!.EpisodeId}_bundle`);
    this._currentIndex = 0;
    this._episode = void 0;

    //hide all view!
    this._backgroundView.clear();
    // this._characterView.clear();
    this._effectView.clear();
    this._textView.clear();
    this._movieView.clear();
    this._fadeView.clear();
    // this._historyView.clear();
    this._uiView.clear();

    //re-create the cover
    this._coverOpening = CoverOpening.new().addTo(this, Layer.CoverLayer);
  }

  public async load(
    source: string | IEpisodeModel,
    translate?: string
  ) {
    return (this._loadPromise = new Promise<IEpisodeModel>(async (res, _) => {
      if (typeof source === "string") {
        if (!isURL(source)) {
          source = resPath.advJson(source);
        }
        source = await loadJson<IEpisodeModel>(source).catch(() => {
          this._coverOpening?.error("The episode ID or URL is not correct, please re-confirm.");
          throw new Error("The episode ID or URL is not correct, please re-confirm.");
        });
      }

      if (!checkImplements<IEpisodeModel>(source)) {
        this._coverOpening?.error("Episode file format error.");
        throw new Error("Episode file format error.");
      }

      if (this._episode) {
        await this.clear();
      }

      //如果有翻譯語言 就load該語言的翻譯文件
      if(translate){
        await this._translationController.load({
          EpId : source.EpisodeId,
          loadParser : translate,
        });
        //如果有翻譯文件 ui配置&load font asset
        if(this._translationController.hasTranslate){
          this._uiView.enableTLBtn();
          this._textView.isTranslate = this._translationController.hasTranslate;
          this._uiView.TranslateBtn.addclickFun(()=>{
            this._textView.isTranslate = this._uiView.TranslateBtn.Pressed;
            this._textView.toggleTextContent();
          })
          //font asset 
          const TLfont = TLFonts.find(font => font.language === translate);
          if(TLfont){
            this._textView.addFontFamily(TLfont.family);
            this._coverOpening.addFontFamily(TLfont.family);
            if(!Assets.cache.has(TLfont.url)){
              this._coverOpening.log('loading assets...');
              await Assets.load(TLfont.url);
            }
          }
        }
      }
      
      this._episode = source as IEpisodeModel;
      this._coverOpening?.init({
          type: this._episode.StoryType,
          chapter: this._episode.Chapter,
          title: this._episode.Title,
          order: this._episode.Order,
          TLTitle : this._translationController.translateModel?.TLTitle,
          info : this._translationController.translateModel?.info
      });

      //load故事所需的資源
      await loadResourcesFromEpisode(
        source, 
        this._isVoice, 
        (percentage) => this._coverOpening?.progress(Math.floor(percentage * 100))
      )
      .catch(() => this._coverOpening?.error());
      
      res(this._episode);
    }));
  }

  public loadAndPlay(
    source: string | IEpisodeModel,
    translate?: string,
    auto?: string
  ) {
    this._autoLock(auto);
    this.load(source, translate).then(() => this._onready());
  }

  public play(auto?: string) {
    this._autoLock(auto);
    if (this._loadPromise) {
      this._loadPromise.then(() => this._onready());
    }
  }

  protected _onready() {
    if (!this._loadPromise) {
      console.log("dont repeat play");
      return;
    }
    this._loadPromise = void 0;
    //cover
    if (this._isAuto) {
      setTimeout(() => {
        this._play();
      },3000);
    } else {
      this._coverOpening?.once("pointertap", this._play, this);
    }
}

  protected _play() {
    this._coverOpening?.close(()=>{
      setTimeout(() => {
        //set click event
        this.on("pointertap", this._tap, this);
        this._renderFrame();
      }, 400)
    });

    //ui view showing
    if(this._isAuto){
      this._uiView!.AutoBtn.Pressed = this._isAuto;
      this._uiView!.hide();
    }
    else{
      this._uiView!.alpha = 1;
    }
    
    this._preRenderFrame();
  }
  
  protected _next() {
    this._currentIndex++;
    return this.currentTrack;
  }

  protected async _preRenderFrame(){
    if(this._currentIndex != 0 || !this.currentTrack) return;
    this._effectView.execute(this.currentTrack);
    this._backgroundView.execute(this.currentTrack);
  }

  protected async _renderFrame() {
    //
    this._trackPromise = void 0;
    // 儲存目前的index
    let index = this._currentIndex;
    // 完結了 或 找不到當前的Track
    if (!this.currentTrack) {
      return;
    }

    TrackLog(index+1, this.Track!.length, this.currentTrack);

    if (this._translationController.hasTranslate) {
      let tl = this._translationController.findTranslate(this.currentTrack.Id);
      if (tl) {
        this.currentTrack.TLSpeakerName = tl.SpeakerName;
        this.currentTrack.TLPhrase = tl.translation || tl.Phrase;
      }
    }

    //對話列表
    // this._historyView.execute(this.currentTrack);

    //過場動畫處理
    let fade_process = this._fadeView.execute(this.currentTrack);
    if (!!fade_process) {
      this._processing.push(fade_process);
    }

    //第一次無須執行 preRenderFrame已經處理過 
    if(index > 0){
      //effect處理
      let effect_process = this._effectView.execute(this.currentTrack);
      if(!!effect_process){
        this._processing.push(effect_process);
      }
      
      //背景處理
      let bg_process = this._backgroundView.execute(this.currentTrack);
      if (!!bg_process) {
        this._processing.push(bg_process);
      }
    };

    //有動畫要處理的話 就隱藏對話框及角色
    if(this._processing.length > 0){
      await this._textView.hideTextPanelAnimation();
      // this._characterView.hideCharacter(); //隱藏在場上的角色
    }

    // SE&BGM 聲音處理
    this._soundController.sound(this.currentTrack);

    // Animations 確保動畫先跑完
    await Promise.all(this._processing.map((_p)=>_p()))
      .then(() => {
        this._processing = [];
      });
    
    //影片處理
    let movie_process = this._movieView.execute(this.currentTrack);
    if (movie_process) {
      // this._characterView.hideCharacter(); //隱藏在場上的角色
      await this._textView.hideTextPanelAnimation();//
      await movie_process(); //確保影片跑完
    }
    
    //spine處理
    //如果有characterImage，則不顯示spine
    if(this.currentTrack.BackgroundCharacterImageFileName){
      // this._characterView.hideCharacter();
    }
    //否則正常執行
    else{
      // this._characterView.execute(this.currentTrack);
    }
    
    //對話處理
    let phrase = this.currentTrack.Phrase;
    let isSameGroup = this.currentTrack.GroupOrder == this.nextTrack?.GroupOrder;
    this._textView.allowNextIconDisplay = !isSameGroup; //如果是同組就不顯示小三角形圖標
    this._textView.execute(this.currentTrack);

    //當播完聲音後 停止spine的口部動作
    // this._soundController.onVoiceEnd = () => this._characterView.offAllLipSync();
  
    //聲音處理
    this._soundController.voice(this.currentTrack);

    //準備下一個unit
    this._next();

    // 計算等候時間
    let duration = Math.max(
      this._soundController.voiceDuration, 
      this._soundController.seDuration, 
      this._textView.typingTotalDuration ?? 0
    );

    // 沒有文字或者同組就自動跳下一個
    if (phrase.length === 0 || isSameGroup) {
      if (isSameGroup) {
        duration += 1200;
      }
      
      setTimeout(() => {
        //確保按下了一次後不會繼續
        if (index + 1 === this._currentIndex) {
          this._renderFrame();
        }
      }, duration);

      return;
    }

    if (this._isAuto) {
      // 計算auto等候時間
      // duration += (advConstant.ProcessingWaitTime * 1000);
      duration += 1700;

      return (this._trackPromise = new Promise((res, _) => {
        let timeout: any = setTimeout(() => {
          clearTimeout(timeout);
          timeout = null;
          // 確保等候完是auto狀態
          if (this._isAuto && index + 1 === this._currentIndex) {
            this._trackPromise = void 0;
            this._renderFrame();
            res(false);
          }
          res(true);
        }, duration);
      }));
    }

    // 如果不是auto 就return
    return (this._trackPromise = new Promise((res, _) => {
      let timeout: any = setTimeout(() => {
        clearTimeout(timeout);
        timeout = null;
        res(true);
      }, duration + 1000);
    }));
    
  }

  protected _onBlur() {
    if (this._isAuto && document.hidden) {
      this._isAuto = false;
      this._uiView!.AutoBtn.Pressed = false;
    }
  }

  protected _tap(e: FederatedPointerEvent) {
    if (e.target !== this) {
      return;
    }
    if (this._processing.length === 0 && !this._isAuto) {
      this._renderFrame();
    }
    if (this._isAuto) {
      this._uiView.ShortShow();
    }
  }

  protected _autoLock(autoString? : string){
    if(autoString?.toLocaleLowerCase() != 'true') return;
    this._isAuto = true;
    this._coverOpening?.setAuto(true);
    document.removeEventListener("visibilitychange", this._handleVisibilityChange);
  }

  get Track() {
    return this._episode?.EpisodeDetail;
  }

  get currentTrack() {
    return this._episode?.EpisodeDetail[this._currentIndex];
  }

  get nextTrack() {
    return this._currentIndex + 1 >= (this._episode?.EpisodeDetail.length ?? 0)
      ? void 0
      : this._episode?.EpisodeDetail[this._currentIndex + 1];
  }

  get isVoice() {
    return this._isVoice;
  }

  set isVoice(bool : boolean){
    this._isVoice = bool;
    this._soundController.isVoice = this._isVoice;
  }

  get TranslationController(){
    return this._translationController;
  }

}
