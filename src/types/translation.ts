export interface IEpisodeTranslateModel {
    translator?: string;
    proofreader?: string;
    TLTitle?: string;
    info?: string;
    TLChapter?: string;
    translateDetail: IEpisodeTranslateUnit[];
}

export interface IEpisodeTranslateUnit {
    Id: string;
    SpeakerName: string;
    Phrase: string;
    translation?: string;
}

export interface FontDetail {
    family: string;
    url: string;
}


/**
 * Translation reader
 * @param {string} language - The language for translation (zhcn, en, ...)
 * @param {string} url - url of the translation files
 * @param {function} read - Method to fetch the translation files
 * @param {object} font - Information about the font (optional)
 *     @property {string} family - Font family
 *     @property {string} url - url of the font file
 */
export interface TranslateReader {
    language: string;
    url: string;
    font?: FontDetail;
    read: (epId: number) => Promise<IEpisodeTranslateModel | undefined>;
}
