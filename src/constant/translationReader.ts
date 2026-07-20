import { TranslationController } from "../controller/translationController";
import { loadTranslateModel } from "../utils/loadResources";
import { TranslateReader } from "../types/translation";

/**
 * 翻譯讀取器
 * @param {string} language - 翻譯的語言 (zhcn, en, ...)
 * @param {string} url - 翻譯文件的位置
 * @param {function} read - 獲取翻譯文件的method
 * @param {object} font - 字體相關資訊 (可選)
 *     @property {string} family - 字體名稱
 *     @property {string} url - 字體文件的位置
 */

/**
 * Translation reader
 * @param {string} language - The language for translation (zhcn, en, ...)
 * @param {string} url - url of the translation files
 * @param {function} read - Method to fetch the translation files
 * @param {object} font - Information about the font (optional)
 *     @property {string} family - Font family
 *     @property {string} url - url of the font file
 */

// zhcn
const zhcnReader: TranslateReader = {
    language: "zhcn",
    url: "https://raw.githubusercontent.com/DreamGallery/WDS-Translation-Csv/main",
    font: {
        family: "Hiraginosansgb",
        url: "./HiraginoSansGB.ttf",
    },
    read: function (epId: number) {
        return loadTranslateModel(`${this.url}/TranslationCsv/${epId}.csv`);
    },
};
TranslationController.addReader(zhcnReader);

//zhcn AI用
const zhcnAIReader: TranslateReader = {
    language: "zhcnai",
    url: "https://raw.githubusercontent.com/huang207/WDS-Translation-Csv/ai",
    font: {
        family: "Hiraginosansgb",
        url: "./HiraginoSansGB.ttf",
    },
    read: function (epId: number) {
        return loadTranslateModel(`${this.url}/TranslationCsv/${epId}.csv`);
    },
};
TranslationController.addReader(zhcnAIReader);

// zhai - 中文机翻
const zhaiReader: TranslateReader = {
    language: "zhai",
    url: "https://wds-translation.littletoxic.top",
    font: {
        family: "Hiraginosansgb",
        url: "./HiraginoSansGB.ttf",
    },
    read: async function (epId: number) {
        const response = await fetch(`${this.url}/${epId}.json`)
        if (!response.ok) {
            if (response.status === 404) {
                // 翻译不存在，返回 void 0
                return void 0;
            }
            throw new Error(response.statusText);
        }
        const jsonData = await response.json();

        // 转换自定义JSON格式为IEpisodeTranslateModel
        if (jsonData && jsonData.translated && Array.isArray(jsonData.translated)) {
            const translateDetail = jsonData.translated.map((item: any, index: number) => ({
                Id: `${epId}${(index + 1).toString().padStart(3, '0')}`, // 生成正确的ID格式：{epid}{index}
                SpeakerName: item.SpeakerName || "",
                Phrase: "", // 原文保持为空，因为这是翻译内容
                translation: item.Phrase || ""
            }));
    
            const TLdetail = {
                translator: "AI翻译",
                translateDetail: translateDetail
            };
            
            return translateDetail.length > 0 ? TLdetail : void 0;
        }

        return void 0;
    },
};
TranslationController.addReader(zhaiReader);

// id
const idReader: TranslateReader = {
    language: "id",
    url: "https://raw.githubusercontent.com/Ryota537/WDS-Translation-Csv/main",
    font: {
        family: "Ronowstd Gbs",
        url: "./RoNOWStd-GBs.otf",
    },
    read: function (epId: number) {
        return loadTranslateModel(`${this.url}/TranslationCsv/${epId}.csv`);
    },
};
TranslationController.addReader(idReader);
