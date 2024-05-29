import { Container, FederatedPointerEvent, Assets, Ticker} from "pixi.js";
import "@pixi-spine/loader-uni";
import "@pixi/sound";
// import { Group } from 'tweedle.js';
//type
import { IEpisodeModel, IEpisodeTranslate } from "./types/Episode";
//views
import { BackgroundView } from "./views/BackgroundView";
import { CharacterView } from "./views/CharacterView";
import { EffectView } from "./views/EffectView";
import { MovieView } from "./views/MovieView";
import { TextView } from "./views/TextView";
import { HistoryView } from "./views/HistoryView";
import { UIView } from "./views/UIView";
import { CoverOpening } from "./views/CoverOpening";
//manager
import { SoundManager } from "./controller/SoundManager";
import { TranslationManager } from "./controller/TranslationManager";
//constant
import { advConstant, baseAssets, Layer } from "./constant/advConstant";
//utils
import { checkImplements, isURL } from "./utils/check";
import createEmptySprite from "./utils/emptySprite";
import loadJson from "./utils/loadJson";
import resPath from "./utils/resPath";
import { banner, TrackLog } from "./utils/logger";

export class AdvPlayer extends Container {
  //init
  // protected _isinited : boolean = false;
  protected _loadPromise: Promise<any> | undefined;
  //View
  protected _backgroundView: BackgroundView;
  protected _characterView: CharacterView;
  protected _effectView: EffectView;
  protected _textView: TextView;
  protected _movieView: MovieView;
  protected _historyView: HistoryView;
  protected _uiView: UIView;
  protected _coverView: CoverOpening;
  //Manager
  protected _soundManager: SoundManager = new SoundManager();
  protected _translationManager: TranslationManager = new TranslationManager();
  //player Info
  protected _episode!: IEpisodeModel | undefined;
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

    //player setting
    this.addChild(createEmptySprite({ color: 0x00dd00 }));
    this.sortableChildren = true;
    this.eventMode = "static";
    document.addEventListener("visibilitychange", this._onBlur.bind(this));

    //views
    this._backgroundView = new BackgroundView().addTo(this,Layer.BackgroundLayer);
    this._characterView = new CharacterView().addTo(this, Layer.CharacterLayer);
    this._effectView = new EffectView().addTo(this, Layer.EffectLayer);
    this._textView = new TextView().addTo(this, Layer.TextLayer);
    this._movieView = new MovieView().addTo(this, Layer.MovieLayer);
    this._historyView = new HistoryView().addTo(this, Layer.HistroyLayer);
    this._uiView = new UIView().addTo(this, Layer.UILayer);
    this._coverView = CoverOpening.new().addTo(this, Layer.CoverLayer);

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
    this._episode = undefined;

    //hide all view!
    this._backgroundView.clear();
    this._characterView.clear();
    this._effectView.clear();
    this._textView.clear();
    this._movieView.clear();
    this._historyView.clear();
    this._uiView.clear();
  }

  public async load(
    source: string | IEpisodeModel,
    translate?: IEpisodeTranslate[]
  ) {
    return (this._loadPromise = new Promise<IEpisodeModel>(async (res, _) => {
      if (typeof source === "string") {
        if (!isURL(source)) {
          source = resPath.advJson(source);
        }
        source = await loadJson<IEpisodeModel>(source).catch(() => {
          throw new Error("The episode ID is wrong, please reconfirm.");
        });
      }

      if (translate) {
        this._translationManager.load(translate);
      }

      if (!checkImplements<IEpisodeModel>(source)) {
        throw new Error("Episode file format error");
      }

      if (!Assets.cache.has(baseAssets.font)) {
        await Assets.load(baseAssets.font);
      }

      if (this._episode) {
        await this.clear();
      }

      this._episode = source as IEpisodeModel;
      this._coverView.init(
        this._episode.StoryType,
        this._episode.Title,
        this._episode.Order
      );
      await this._loadResourcesFromEpisode(source);

      res(this._episode);
    }));
  }

  public loadAndPlay(
    source: string | IEpisodeModel,
    translate?: IEpisodeTranslate[]
  ) {
    this.load(source, translate).then(() => this._onready());
  }

  protected async _loadResourcesFromEpisode(episodeTrack: IEpisodeModel) {
    const resources = {} as Record<string, string>;

    const bgmlist = await loadJson<string[]>(resPath.bgmMaster);
    const selist = await loadJson<string[]>(resPath.seMaster);

    episodeTrack.EpisodeDetail.forEach((unit) => {
      //Backgorund
      if (unit.BackgroundImageFileName) {
        if (!resources[`bg_${unit.BackgroundImageFileName}`]) {
          resources[`bg_${unit.BackgroundImageFileName}`] = resPath.background(
            unit.BackgroundImageFileName
          );
        }
      }

      //CharacterImages
      if (unit.BackgroundCharacterImageFileName) {
        if (!resources[`card_${unit.BackgroundCharacterImageFileName}`]) {
          resources[`card_${unit.BackgroundCharacterImageFileName}`] =
            resPath.cards(unit.BackgroundCharacterImageFileName);
        }
      }

      //still
      if (unit.StillPhotoFileName) {
        if (!resources[`still_${unit.StillPhotoFileName}`]) {
          resources[`still_${unit.StillPhotoFileName}`] = resPath.still(
            unit.StillPhotoFileName
          );
        }
      }

      //movie
      if (unit.MovieFileName) {
        if (!resources[`movie_${unit.MovieFileName}`]) {
          resources[`movie_${unit.MovieFileName}`] = resPath.movie(
            unit.MovieFileName
          );
        }
      }

      //bgm
      if (unit.BgmFileName) {
        if (
          bgmlist.includes(unit.BgmFileName) &&
          unit.BgmFileName != "999" &&
          !resources[`bgm_${unit.BgmFileName}`]
        ) {
          resources[`bgm_${unit.BgmFileName}`] = resPath.bgm(unit.BgmFileName);
        }
      }

      //Se
      if (unit.SeFileName) {
        if (
          selist.includes(unit.SeFileName) &&
          !resources[`se_${unit.SeFileName}`]
        ) {
          resources[`se_${unit.SeFileName}`] = resPath.se(unit.SeFileName);
        }
      }

      //spine
      unit.CharacterMotions.forEach((motion) => {
        if (motion.SpineId != 0 && !resources[`spine_${motion.SpineId}`]) {
          resources[`spine_${motion.SpineId}`] = resPath.spine(motion.SpineId);
        }
      });
    });

    //voice
    this._soundManager.isVoice = this._isVoice;
    if (this._isVoice) {
      let voicemanifest = await loadJson<string[]>(
        resPath.manifest(episodeTrack.EpisodeId)
      );
      voicemanifest.forEach((VoiceFileName) => {
        resources[`voice_${VoiceFileName}`] = resPath.voice(
          episodeTrack.EpisodeId,
          VoiceFileName
        );
      });
    }

    Assets.addBundle(`${this._episode!.EpisodeId}_bundle`, resources);
    return Assets.loadBundle(
      `${this._episode!.EpisodeId}_bundle`,
      (percentage) => {
        this._coverView.start(Math.floor(percentage * 100));
      }
    );
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
    this._loadPromise = undefined;
    //cover
    this._coverView.once("pointertap", this._play, this);
  }

  protected _play() {
    this._coverView.close();
    //ui view
    this._uiView.alpha = 1;
    this._uiView.AutoBtn.addclickFun(() => {
      this._isAuto = this._uiView.AutoBtn.Pressed;
      if (this._isAuto && this._trackPromise) {
        this._trackPromise.then((bool) => {
          //不要在等待過程中
          if (bool) {
            this._renderFrame();
          }
        });
      }
    });
    //click
    this.on("pointertap", this._tap, this);
    this._renderFrame();
  }

  protected _next() {
    this._currentIndex++;
    return this.currentTrack;
  }

  protected async _renderFrame() {
    //
    this._trackPromise = undefined;
    // 儲存目前的index
    let index = this._currentIndex;
    // 如果完結了 或 找不到當前的Track
    if (!this.currentTrack) {
      return;
    }

    TrackLog(index, this.Track!.length, this.currentTrack);

    if (this._translationManager.isTranslate) {
      let tl = this._translationManager.getTranslate(this.currentTrack.Id);
      if (tl) {
        this.currentTrack.Phrase = tl.Phrase;
        this.currentTrack.SpeakerName = tl.SpeakerName;
      }
    }

    //對話列表
    this._historyView.execute(this.currentTrack);

    // 隱藏上輪的
    this._soundManager.stopPrevSound();
    this._effectView.hideEffect(this.currentTrack);

    //背景處理
    let bg_process = this._backgroundView.execute(this.currentTrack);
    let phrase = this.currentTrack.Phrase;
    if (bg_process) {
      this._characterView.hideCharacter(); //隱藏在場上的角色
      this._textView.hideTextPanel(); //
      this._processing.push(bg_process);
      await bg_process;
    }

    //影片處理
    let movie_process = this._movieView.execute(this.currentTrack);
    if (movie_process) {
      this._characterView.hideCharacter(); //隱藏在場上的角色
      this._textView.hideTextPanel(); //
      this._processing.push(movie_process);
      await movie_process;
    }

    //effect處理
    this._effectView.execute(this.currentTrack);
    //spine處理
    this._characterView.execute(this.currentTrack);
    //對話處理
    let nextorder = this.nextTrack?.Order ?? 1;
    this._textView.allowNextIconDisplay = nextorder;
    this._textView.execute(this.currentTrack);

    //聲音處理
    this._soundManager.execute(this.currentTrack);
    //當播完聲音後 停止spine的口部動作
    this._soundManager.onVoiceEnd.push(() =>
      this._characterView.offAllLipSync()
    );

    //準備下一個unit
    this._next();

    // Animations 確保不是正在動畫中被按下至下一個
    if (this._processing.length > 0) {
      await Promise.all(this._processing)
        .then(() => {
          this._processing = [];
        });
    }

    // 計算等候時間
    let voice_duration = this._soundManager.voiceDuration;
    let text_duration = this._textView.typingTotalDuration ?? 0;
    let duration = Math.max(voice_duration, text_duration);

    // 處理沒有文字 自動跳下一個
    if (phrase.length === 0 || nextorder > 1) {
      if (nextorder > 1) {
        duration += 800;
      }

      let timeout: any = setTimeout(() => {
        clearTimeout(timeout);
        timeout = undefined;
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
            this._trackPromise = undefined;
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
      ? undefined
      : this._episode?.EpisodeDetail[this._currentIndex + 1];
  }

  get isVoice() {
    return this._isVoice;
  }
}
