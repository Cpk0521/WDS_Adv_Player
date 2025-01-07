import { FontDetail, IEpisodeTranslateModel, TranslateReader } from "../types/translation";

export interface TLProps {
  EpId : number;
  loadParser? : string;
  content? : IEpisodeTranslateModel,
  font? : FontDetail;
}

export class TranslationController {
  protected static readonly _TLReaderMap : Map<string, TranslateReader> = new Map();
  protected _translateModel: IEpisodeTranslateModel | undefined;
  protected _currentLanguage : FontDetail | undefined;
  protected _hasTranslate = false;

  async load(options : TLProps){
    if(options.content){
      this._translateModel = options.content;
      if(options.font){
        this._currentLanguage = options.font;
      }
      else if(options.loadParser){
        this._currentLanguage = TranslationController.getReader(options.loadParser)?.font;
      }
      return this._hasTranslate = true;
    }
    
    let reader : TranslateReader | undefined;
    if(options.loadParser){
      reader = TranslationController.getReader(options.loadParser);
    }
    if(!reader){
      console.error('No Translate Reader found');
      return this._hasTranslate = false;
    }
    
    try{
      this._translateModel = await reader.read(options.EpId);
      if(this._translateModel){
        this._currentLanguage = reader.font;
        this._hasTranslate = true;
      }
    }catch(e){
      console.error('No Translate file found');
      return this._hasTranslate = false;
    }

    return this._hasTranslate;
  }

  static addReader(reader : TranslateReader){
    if (this._TLReaderMap.has(reader.language)) {
      console.info('the reader for this language already exists')
      return;
    }
    this._TLReaderMap.set(reader.language, reader);
    return reader;
  }

  static removeReader(language : string){
    return this._TLReaderMap.delete(language);
  }

  static getReader(language : string){
    return this._TLReaderMap.get(language);
  }

  get hasTranslate() {
    return this._hasTranslate;
  }

  get translateModel(){
    return this._translateModel;
  }

  getFont(){
    return this._currentLanguage
  }

  findTranslate(id: number) {
    return this._translateModel?.translateDetail.find((tl) => Number(tl.Id) === id);
  }
}
