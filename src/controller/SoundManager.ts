import { Assets } from "@pixi/assets";
import { IMediaInstance, sound, Sound } from "@pixi/sound";
import { IEpisodeSound } from "../types/Episode";
import { IViewController } from "../types/View";

export class SoundManager implements IViewController {
  protected _isVoice: boolean = true;
  protected _voiceDuration: number = 0;
  protected _currentBgm: Sound | undefined | null = null;
  protected _currentVoice: Sound | undefined | null = null;
  protected _currentSe: Sound | undefined | null = null;
  protected _onVoiceEnd: Function[] = [];

  static new() {
    return new this();
  }

  constructor() {
    sound.disableAutoPause = true;
    sound.volumeAll = 0.1;
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

    this._onVoiceEnd = [];
    this._voiceDuration = 0;
  }

  execute({ BgmFileName, SeFileName, VoiceFileName }: IEpisodeSound) {
    this._voiceDuration = 0;
    this.stopPrevSound();

    if (BgmFileName) {
      this._playBgm(BgmFileName);
    }

    if (SeFileName) {
      this._playSe(SeFileName);
    }

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

    if (Assets.cache.has(`bgm_${FileName}`)) {
      this._currentBgm?.stop();
      this._currentBgm = Assets.get(`bgm_${FileName}`);
      this._currentBgm?.play({
        loop: true,
        singleInstance: true,
        volume: 0.6,
      });
    }
  }

  _playSe(FileName: string) {
    if (Assets.cache.has(`se_${FileName}`)) {
      this._currentSe = Assets.get(`se_${FileName}`);
      let instance = this._currentSe?.play();
      this._voiceDuration = Math.max(
        (this._currentSe?.duration ?? 0) * 1000,
        this._voiceDuration
      );

      (instance as IMediaInstance).on("end", () => {
        this._currentSe = null;
      });
    }
  }

  _playVoice(FileName: string) {
    if (!this._isVoice) {
      this._voiceDuration = Math.max(5000, this._voiceDuration);
      let timeout = setTimeout(() => {
        clearTimeout(timeout);
        this._onVoiceEnd.forEach((func) => func());
        this._onVoiceEnd = [];
      }, 5000);
      return;
    }

    if (Assets.cache.has(`voice_${FileName}`)) {
      this._currentVoice = Assets.get(`voice_${FileName}`);
      let instance = this._currentVoice?.play();
      this._voiceDuration = Math.max(
        (this._currentVoice?.duration ?? 0) * 1000,
        this._voiceDuration
      );

      (instance as IMediaInstance).on("end", () => {
        this._onVoiceEnd.forEach((func) => func());
        this._onVoiceEnd = [];
        this._currentVoice = null;
      });
    }
  }

  stopPrevSound() {
    this._currentSe?.stop();
    this._currentVoice?.stop();
  }

  get voiceDuration() {
    return this._voiceDuration;
  }

  get onVoiceEnd() {
    return this._onVoiceEnd;
  }

  set isVoice(bool: boolean) {
    this._isVoice = bool;
  }

  get isVoice() {
    return this._isVoice;
  }
}
