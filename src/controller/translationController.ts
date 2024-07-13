// import { Assets } from '@pixi/assets'
import { IEpisodeTranslateModel } from "../types/Episode";

export class TranslationController {
  protected _translate: IEpisodeTranslateModel[] = [];
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
