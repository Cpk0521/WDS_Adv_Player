// import { Assets } from '@pixi/assets'
import { IEpisodeTranslate } from "../types/Episode";

export class TranslationController {
  protected _translate: IEpisodeTranslate[] = [];
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
