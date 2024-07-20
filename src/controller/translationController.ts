// import { Assets } from '@pixi/assets'
import { IEpisodeTranslateDetail } from "../types/translation";

export class TranslationController {
  protected _translate: IEpisodeTranslateDetail[] = [];
  protected _isTranslate = false;

  load(translate: any) {
    this._translate = [...translate];
    this._isTranslate = true;
  }

  get isTranslate() {
    return this._isTranslate;
  }

  getTranslate(id: number) {
    return this._translate.find((tl) => tl.Id === id);
  }
}


