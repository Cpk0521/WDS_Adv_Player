// Episode Translation
export interface IEpisodeTranslateModel {
    translator: string;
    proofreader?: string;
    translateDetail: IEpisodeTranslateDetail[];
}

export interface IEpisodeTranslateDetail {
    Id: number;
    SpeakerName?: string;
    Phrase: string;
}

//Controller
export const languageVals = ["en", "zhcn", "zhtw"] as const;

export interface TranslateReader {
    name?: string;
    language: typeof languageVals[number];
    font? : string;
    url: string;
    read: (epId: number) => Promise<IEpisodeTranslateModel | undefined>;
}

export type TLProps = {
    EpId : number;
    loadParser? : string;
    content? : IEpisodeTranslateModel;
}