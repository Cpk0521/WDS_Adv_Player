// import { Assets } from '@pixi/assets'
import { IEpisodeTranslateModel, IEpisodeTranslateDetail, TranslateReader, languageVals, TLProps} from "../types/translation";
import { loadCsv, loadJson } from "../utils/loadResources";
// import { mixObject } from "../utils/mixObject";

// const ENReader : TranslateReader = {
//   language : 'en',
//   url : '',
//   async read(epId) {
//     let source = `${this.url}/${epId}.json`;
//     return await loadJson<IEpisodeTranslateModel>(source);
//   }
// }

const zhcnReader : TranslateReader = {
  language : 'zhcn',
  url : 'https://raw.githubusercontent.com/DreamGallery/WDS-Translation-Csv/main',
  async read(epId) {
    let source = `${this.url}/TranslationCsv/${epId}.csv`;
    const records = await loadCsv<any>(source);
    let translateColumn: IEpisodeTranslateDetail[] = [];
    for(let record of records) {
      let temp = record;
      temp["Phrase"] = record["translation"];
      delete temp["translation"];
      translateColumn.push(temp);
    }
    return translateColumn.length > 1 ?
    {
      translator : '',
      translateDetail : translateColumn
    } :
    void 0;
  }
}

export class TranslationController {

  protected readonly _TLReaderMap : Map<string, TranslateReader> = new Map([
    // [ENReader.language, ENReader],
    [zhcnReader.language, zhcnReader],
    // [zhtwReader.language, zhtwReader]
  ]);
  protected _translateModel: IEpisodeTranslateModel | undefined;
  protected _hasTranslate = false;

  async load(options : TLProps){
    if(options.content){
      this._translateModel = options.content;
      this._hasTranslate = true;
      return this._hasTranslate;
    }
    
    let reader : TranslateReader | undefined;
    if(options.loadParser){
      reader = this._TLReaderMap.get(options.loadParser);
    }
    if(!reader){
      throw Error('No Translate Reader found');
    }

    this._translateModel = await reader.read(options.EpId);
    if(this._translateModel){
      this._hasTranslate = true;
    }

    return this._hasTranslate;
  }

  addReader(reader : TranslateReader){
    // let newreader = mixObject({...ENReader}, reader)
    if (this._TLReaderMap.has(reader.language)) {
      console.info('the reader for this language already exists')
      return;
    }
    this._TLReaderMap.set(reader.language, reader);
    return reader;
  }

  removeReader(language : string){
    return this._TLReaderMap.delete(language);
  }

  get hasTranslate() {
    return this._hasTranslate;
  }

  get translateModel(){
    return this._translateModel;
  }

  findTranslate(id: number) {
    return this._translateModel?.translateDetail.find((tl) => Number(tl.Id) === id);
  }
}