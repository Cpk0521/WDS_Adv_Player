import { Assets } from "pixi.js";
import { IMediaInstance, sound, Sound } from "@pixi/sound";
import { Tween } from "tweedle.js";
import { IEpisodeSound } from "../types/Episode";

export class SoundController {
  protected _isVoice: boolean = true;
  protected _voiceDuration: number = 0;
  protected _seDuration: number = 0;
  protected _currentBgm: Sound | undefined | null = null;
  protected _currentVoice: Sound | undefined | null = null;
  protected _currentSe: Sound | undefined | null = null;
  protected _onVoiceEnd: Function | undefined;

  static new() {
    return new this();
  }

  constructor() {
    sound.disableAutoPause = true;
    sound.volumeAll = 0.5;
  }

  public reset() {
    if (this._currentVoice) {
      this._currentVoice.stop();
      this._currentVoice = null;
    }

    if (this._currentBgm) {
      this._currentBgm.stop();
      this._currentBgm = null;
    }

    if (this._currentSe) {
      this._currentSe.stop();
      this._currentSe = null;
    }

    this._onVoiceEnd = undefined;
    this._voiceDuration = 0;
  }

  sound({ BgmFileName, SeFileName }: IEpisodeSound) {
    this.stopPrevSound();

    if (BgmFileName) {
      this._playBgm(BgmFileName);
    }

    if (SeFileName) {
      this._playSe(SeFileName);
    }

  }

  voice({ VoiceFileName }: IEpisodeSound){
    this._currentVoice?.stop();

    if (VoiceFileName) {
      this._playVoice(VoiceFileName);
    }
  }

  _playBgm(FileName: string) {
    if (FileName === "999") {
      this._currentBgm?.stop();
      this._currentBgm = null;
      return;
    }

    // if(this._currentBgm){
    //   //BGM漸出
    // }

    if (Assets.cache.has(`bgm_${FileName}`)) {
      this._currentBgm?.stop();
      this._currentBgm = Assets.get(`bgm_${FileName}`);
      this._currentBgm?.play({
        loop: true,
        singleInstance: true,
        volume: 0.4,
      });
    }
  }

  _playSe(FileName: string) {
    if (Assets.cache.has(`se_${FileName}`)) {
      this._currentSe = Assets.get(`se_${FileName}`);
      let instance = this._currentSe?.play();
      this._seDuration = ((this._currentSe?.duration ?? 0) * 1000);

      // this._currentSe?.context.audioContext.
      const context = (instance as IMediaInstance);
      
      context.on('progress', ()=>{
        this._seDuration = (((1-context.progress) * (this._currentSe?.duration || 0)) * 1000) + 500;
      });

      context.once("end", () => {
        context.off('progress');
        this._currentSe = null;
      });
    }
  }

  _playVoice(FileName: string) {
    //不開聲音
    if (!this._isVoice) {
      this._voiceDuration = Math.max(3000, this._voiceDuration);
      setTimeout(() => {
        this._onVoiceEnd?.();
        // this._onVoiceEnd = void 0;
      }, 5000);

      return;
    }

    if (Assets.cache.has(`voice_${FileName}`)) {
      this._currentVoice = Assets.get(`voice_${FileName}`);
      this._voiceDuration = Math.max(
        (this._currentVoice?.duration ?? 0) * 1000,
        this._voiceDuration
      );

      let instance = this._currentVoice?.play();
      (instance as IMediaInstance).once("end", () => {
        this._onVoiceEnd?.();
        // this._onVoiceEnd = void 0;
        this._currentVoice = null;
      });
    }
  }

  stopPrevSound() {
    this._currentSe?.stop();
    this._currentVoice?.stop();
    this._voiceDuration = 0;
    this._seDuration = 0;
  }

  get voiceDuration() {
    return this._voiceDuration;
  }

  get seDuration() {
    return this._seDuration;
  }

  get onVoiceEnd() : Function | undefined {
    return this._onVoiceEnd;
  }

  set onVoiceEnd(callback : Function){
    this._onVoiceEnd = callback;
  }

  set isVoice(bool: boolean) {
    this._isVoice = bool;
  }

  get isVoice() {
    return this._isVoice;
  }
}