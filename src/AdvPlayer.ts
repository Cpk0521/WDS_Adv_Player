import { Container, FederatedPointerEvent, Assets, Ticker} from "pixi.js";
import "@pixi-spine/loader-uni";
import "@pixi/sound";
// import { Group } from 'tweedle.js';
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
import { loadJson, loadResourcesFromEpisode } from './utils/loadResources'
import { banner, TrackLog } from "./utils/logger";

export class AdvPlayer extends Container {
  //init
  protected _loadPromise: Promise<any> | undefined;
  //View
  protected _backgroundView: BackgroundView;
  protected _characterView: CharacterView;
  protected _effectView: EffectView;
  protected _textView: TextView;
  protected _movieView: MovieView;
  protected _fadeView : FadeView;
  // protected _historyView: HistoryView;
  protected _uiView: UIView;
  protected _coverOpening: CoverOpening;
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
  protected _processing: Promise<any>[] = [];
  protected _trackPromise: Promise<boolean> | undefined;

  constructor() {
    super();

    //spine pma setting
    Assets.setPreferences({
      preferCreateImageBitmap: false,
    });

    //register the tweedle timer to pixi ticker
    // Ticker.shared.add(() => Group.shared.update());

    //advPlayer setting
    this.addChild(createEmptySprite({ empty : true, color: 0x00dd00 }));
    this.sortableChildren = true;
    this.eventMode = "static";
    document.addEventListener("visibilitychange", this._onBlur.bind(this));

    //views
    this._uiView = new UIView().addTo(this, Layer.UILayer);
    // this._historyView = new HistoryView().addTo(this, Layer.HistroyLayer);
    this._fadeView = new FadeView().addTo(this, Layer.FadeLayer);
    this._movieView = new MovieView().addTo(this, Layer.MovieLayer);
    this._textView = new TextView().addTo(this, Layer.TextLayer);
    this._effectView = new EffectView().addTo(this, Layer.EffectLayer);
    this._characterView = new CharacterView().addTo(this._effectView, Layer.CharacterLayer);
    this._backgroundView = new BackgroundView().addTo(this._effectView, Layer.BackgroundLayer);

    //Cover
    this._coverOpening = CoverOpening.new().addTo(this, Layer.CoverLayer);
    
    //log
    banner();
  }

  public static create() {
    return new this();
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
    this._characterView.clear();
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
          this._coverOpening.error("The episode ID or URL is not correct, please re-confirm.");
          throw new Error("The episode ID or URL is not correct, please re-confirm.");
        });
      }

      if (!checkImplements<IEpisodeModel>(source)) {
        this._coverOpening.error("Episode file format error.");
        throw new Error("Episode file format error.");
      }

      if (!Assets.cache.has(baseAssets.font)) {
        await Assets.load(baseAssets.font);
      }

      if (this._episode) {
        await this.clear();
      }

      this._episode = source as IEpisodeModel;
      this._coverOpening.init(
        this._episode.StoryType,
        this._episode.Chapter,
        this._episode.Title,
        this._episode.Order
      );

      if (translate) {
        await this._translationController.load({
          EpId : source.EpisodeId,
          loadParser : translate
        });
        const TLfont = TLFonts.find(font => font.language === translate);
        if(TLfont && this._translationController.hasTranslate){
          this._uiView.enableTLBtn();
          this._textView.isTranslate = this._translationController.hasTranslate;
          this._uiView.TranslateBtn.addclickFun(()=>{
            this._textView.isTranslate = this._uiView.TranslateBtn.Pressed;
            this._textView.toggleTextContent();
          })
          // load TL font
          this._textView.addFontFamily(TLfont.family);
          this._coverOpening.log('loading translate font...');
          await Assets.load(TLfont.url);
        }
      }

      await loadResourcesFromEpisode(
        source, 
        this._isVoice, 
        (percentage) => this._coverOpening.progress(Math.floor(percentage * 100))
      )
      .catch(() => this._coverOpening.error());

      res(this._episode);
    }));
  }

  public loadAndPlay(
    source: string | IEpisodeModel,
    translate?: string
  ) {
    this.load(source, translate).then(() => this._onready());
  }

  public play() {
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
    this._coverOpening.once("pointertap", this._play, this);
  }

  protected _play() {
    this._coverOpening.close(()=>{
      setTimeout(() => {
        //set click event
        this.on("pointertap", this._tap, this);
        this._renderFrame();
      }, 400)
    });

    //ui view
    this._uiView.alpha = 1;
    this._uiView.AutoBtn.addclickFun(() => {
      this._isAuto = this._uiView.AutoBtn.Pressed;
      if (this._isAuto && this._trackPromise) {        
        this._trackPromise.then((bool : boolean) => {
          //確保開了auto後會自動播放下一個並且不會重複執行
          if (bool) {
            this._renderFrame();
          }
        });
      }
    });

    this._preRenderFrame();
  }
  
  protected _next() {
    this._currentIndex++;
    return this.currentTrack;
  }

  protected async _preRenderFrame(){
    if(this._currentIndex != 0 || !this.currentTrack) return;
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
        this.currentTrack.TLPhrase = tl.Phrase;
      }
    }

    //對話列表
    // this._historyView.execute(this.currentTrack);

    // 隱藏上輪的
    this._soundController.sound(this.currentTrack);
    this._effectView.hideEffect(this.currentTrack);

    let fade_process = this._fadeView.execute(this.currentTrack);
    if (fade_process) {
      this._processing.push(fade_process);
      this._characterView.hideCharacter(); //隱藏在場上的角色
      this._textView.hideTextPanel(); //
      // await fade_process;
    }

    //effect處理
    this._effectView.execute(this.currentTrack);

    //背景處理
    if(index > 0){
      let bg_process = this._backgroundView.execute(this.currentTrack);
      if (bg_process) {
        this._processing.push(bg_process);
        this._characterView.hideCharacter(); //隱藏在場上的角色
        this._textView.hideTextPanel(); //
        // await bg_process;
      }
    };

    // Animations 確保動畫跑完
    await Promise.all(this._processing)
      .then(() => {
        this._processing = [];
      });

    //影片處理
    let movie_process = this._movieView.execute(this.currentTrack);
    if (movie_process) {
      // this._processing.push(movie_process);
      this._characterView.hideCharacter(); //隱藏在場上的角色
      this._textView.hideTextPanel(); //
      await movie_process; //確保影片跑完
    }
    
    //spine處理
    this._characterView.execute(this.currentTrack);
    
    //對話處理
    let phrase = this.currentTrack.Phrase;
    let isSameGroup = this.currentTrack.GroupOrder == this.nextTrack?.GroupOrder;
    this._textView.allowNextIconDisplay = !isSameGroup; //如果是同組就不顯示小三角形圖標
    this._textView.execute(this.currentTrack);

    //當播完聲音後 停止spine的口部動作
    this._soundController.onVoiceEnd = () => this._characterView.offAllLipSync();
  
    //聲音處理
    this._soundController.voice(this.currentTrack);

    //準備下一個unit
    this._next();

    // 計算等候時間
    let duration = Math.max(
      this._soundController.voiceDuration, 
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
      duration += 1500;

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
      this._uiView.AutoBtn.Pressed = false;
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
