import { loadCsv } from "../utils/loadResources";

export interface IEpisodeTranslateModel {
  translator?: string;
  proofreader?: string;
  TLTitle? : string;
  info? : string;
  translateDetail: IEpisodeTranslateDetail[];
}

export interface IEpisodeTranslateDetail {
  Id: string ;
  SpeakerName: string;
  Phrase: string;
  translation? : string
}

export const languageVals = ["en", "zhcn", "zhtw"] as const;

export interface TranslateReader {
    name?: string;
    language: typeof languageVals[number];
    font? : string;
    url: string;
    read: (epId: number) => Promise<IEpisodeTranslateModel | undefined>;
}

export interface TLProps {
  EpId : number;
  loadParser? : string;
  content? : IEpisodeTranslateModel;
}

// const ENReader : TranslateReader = {
//   language : 'en',
//   url : '',
//   async read(epId) {
//     let source = `${this.url}/${epId}.json`;
//     const records = await loadCsv<IEpisodeTranslateDetail>(source);
//     let translateColumn: IEpisodeTranslateDetail[] = [];
//     for(let record of records) {
//       let temp = record;
//       temp["Phrase"] = record["translation"] || '';
//       delete temp["translation"];
//       translateColumn.push(temp);
//     }
//     return translateColumn.length > 1 ?
//     {
//       translateDetail : translateColumn
//     } :
//     void 0;
//   }
// }

const zhcnReader : TranslateReader = {
  language : 'zhcn',
  url : 'https://raw.githubusercontent.com/DreamGallery/WDS-Translation-Csv/main',
  async read(epId) : Promise<IEpisodeTranslateModel | undefined> {
    let source = `${this.url}/TranslationCsv/${epId}.csv`;
    const records = await loadCsv<IEpisodeTranslateDetail>(source);
    const TLdetail : IEpisodeTranslateModel = {
      translateDetail : records.filter((record) => record.Phrase) as IEpisodeTranslateDetail[],
    }
    for(let record of records.filter((record) => !record.Phrase)) {
      if(record.Id.toLowerCase() === 'translator'){
        TLdetail.translator = record.SpeakerName;
      }
      if(record.Id.toLowerCase() === 'proofreader'){
        TLdetail.proofreader = record.SpeakerName;
      }
      if(record.Id.toLowerCase() === 'title' || record.Id.toLowerCase() === 'tltitle'){
        TLdetail.TLTitle = record.SpeakerName;
      }
      if(record.Id.toLowerCase() === 'info'){
        TLdetail.info = record.SpeakerName;
      }
    }
    return records.length > 1 ? TLdetail : void 0;
  }
}

export class TranslationController {

  protected readonly _TLReaderMap : Map<string, TranslateReader> = new Map([
    // [ENReader.language, ENReader],
    [zhcnReader.language, zhcnReader],
  ]);
  protected _translateModel: IEpisodeTranslateModel | undefined;
  protected _hasTranslate = false;

  async load(options : TLProps){
    if(options.content){
      this._translateModel = options.content;
      return this._hasTranslate = true;
    }
    
    let reader : TranslateReader | undefined;
    if(options.loadParser){
      reader = this._TLReaderMap.get(options.loadParser);
    }
    if(!reader){
      console.error('No Translate Reader found');
      return this._hasTranslate = false;
    }
    
    try{
      this._translateModel = await reader.read(options.EpId);
      if(this._translateModel){
        this._hasTranslate = true;
      }
    }catch(e){
      console.error('No Translate file found');
      return this._hasTranslate = false;
    }

    return this._hasTranslate;
  }

  addReader(reader : TranslateReader){
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
