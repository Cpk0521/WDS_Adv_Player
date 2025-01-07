export interface IEpisodeTranslateModel {
    translator?: string;
    proofreader?: string;
    TLTitle?: string;
    info?: string;
    translateDetail: IEpisodeTranslateDetail[];
}

export interface IEpisodeTranslateDetail {
    Id: string;
    SpeakerName: string;
    Phrase: string;
    translation?: string;
}

export interface FontDetail {
    family: string;
    url: string;
}

export interface TranslateReader {
    language: string;
    url: string;
    font?: FontDetail;
    read: (epId: number) => Promise<IEpisodeTranslateModel | undefined>;
}
