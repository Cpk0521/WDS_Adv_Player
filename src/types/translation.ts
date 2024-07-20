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

export const languageVals = ["en", "zh-cn", "zh-tw"] as const;

export interface TranslateReader {
    name?: string;
    language: (typeof languageVals)[number];
    url: string;
    read: (epId: string) => Promise<IEpisodeTranslateModel | undefined>;
}
