import { TranslationController } from "../controller/translationController";
import { loadTranslateModel, loadTranslateModelFromJson } from "../utils/loadResources";
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
    read: function (epId: number) {
        return loadTranslateModelFromJson(`${this.url}/${epId}.json`, epId);
    },
};
TranslationController.addReader(zhaiReader);
