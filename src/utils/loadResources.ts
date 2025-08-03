import { Assets, AssetsBundle, ProgressCallback } from "pixi.js";
import "@pixi/sound";
import '@esotericsoftware/spine-pixi-v8'
import resPath from "./resPath";
import { IEpisodeModel } from "../types/Episode";
import { parse } from 'papaparse'
import { IEpisodeTranslateUnit, IEpisodeTranslateModel } from "../types/translation";

export async function loadJson<T extends Object>(source : string) : Promise<T>{
    return fetch(source)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json() as Promise<T>;
        })
}

export async function loadCsv<T>(source : string) : Promise<T[]>{
    return fetch(source)
        .then(response => {
            if(!response.ok){
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(async (csvtext)=>{
            return parse(csvtext, {header: true}).data as T[];
        })
}

export async function loadResourcesFromEpisode(
    episodeTrack: IEpisodeModel,
    isVoice?: boolean,
    callback?: ProgressCallback,
) {
    const resources = {} as Record<string, string>;

    const bgmlist = await loadJson<string[]>(resPath.bgmMaster);
    const selist = await loadJson<string[]>(resPath.seMaster);

    episodeTrack.EpisodeDetail.forEach((unit) => {
        //Backgorund
        if (unit.BackgroundImageFileName) {
            if (!resources[`bg_${unit.BackgroundImageFileName}`]) {
                resources[`bg_${unit.BackgroundImageFileName}`] =
                    resPath.background(unit.BackgroundImageFileName);
            }
        }

        //CharacterImages
        if (unit.BackgroundCharacterImageFileName) {
            if (!resources[`card_${unit.BackgroundCharacterImageFileName}`]) {
                resources[`card_${unit.BackgroundCharacterImageFileName}`] =
                    resPath.cards(unit.BackgroundCharacterImageFileName);
            }
        }

        //still
        if (unit.StillPhotoFileName) {
            if (!resources[`still_${unit.StillPhotoFileName}`]) {
                resources[`still_${unit.StillPhotoFileName}`] = resPath.still(
                    unit.StillPhotoFileName
                );
            }
        }

        //movie
        if (unit.MovieFileName) {
            if (!resources[`movie_${unit.MovieFileName}`]) {
                resources[`movie_${unit.MovieFileName}`] = resPath.movie(
                    unit.MovieFileName
                );
            }
        }

        //bgm
        if (unit.BgmFileName) {
            if (
                bgmlist.includes(unit.BgmFileName) &&
                unit.BgmFileName != "999" &&
                !resources[`bgm_${unit.BgmFileName}`]
            ) {
                resources[`bgm_${unit.BgmFileName}`] = resPath.bgm(
                    unit.BgmFileName
                );
            }
        }

        //Se
        if (unit.SeFileName) {
            if (
                selist.includes(unit.SeFileName) &&
                !resources[`se_${unit.SeFileName}`]
            ) {
                resources[`se_${unit.SeFileName}`] = resPath.se(
                    unit.SeFileName
                );
            }
        }

        //spine
        unit.CharacterMotions.forEach((motion) => {
            if (motion.SpineId != 0 && !resources[`spine_${motion.SpineId}`]) {
                resources[`spine_${motion.SpineId}`] = resPath.spine(
                    motion.SpineId
                );
                resources[`spine_atlas_${motion.SpineId}`] = resPath.spine_atlas(
                    motion.SpineId
                );
            }
        });
    });

    // voice
    if (isVoice) {
        let voicemanifest = await loadJson<string[]>(
            resPath.manifest(episodeTrack.EpisodeId)
        );
        voicemanifest.forEach((VoiceFileName) => {
            resources[`voice_${VoiceFileName}`] = resPath.voice(
                episodeTrack.EpisodeId,
                VoiceFileName
            );
        });
    }

    Assets.addBundle(`${episodeTrack.EpisodeId}_bundle`, resources);
    return Assets.loadBundle(`${episodeTrack.EpisodeId}_bundle`, callback)
}

export function loadPlayerAssetsBundle(name : string, bundle : AssetsBundle["assets"]){
    Assets.addBundle(name, bundle);
    return Assets.loadBundle(name);
}

export async function loadTranslateModel(source : string){
    const records = await loadCsv<IEpisodeTranslateUnit>(source);
    const TLdetail : IEpisodeTranslateModel = {
        translateDetail : records.filter((record) => record.Phrase) as IEpisodeTranslateUnit[],
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
        if(record.Id.toLowerCase() === 'chapter' || record.Id.toLowerCase() === 'tlchapter'){
            TLdetail.TLChapter = record.SpeakerName;
        }
    }
    
    return records.length > 0 ? TLdetail : void 0;
}

export async function loadTranslateModelFromJson(source : string, epid: number){
    const response = await fetch(source);
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
            Id: `${epid}${(index + 1).toString().padStart(3, '0')}`, // 生成正确的ID格式：{epid}{index}
            SpeakerName: item.SpeakerName || "",
            Phrase: "", // 原文保持为空，因为这是翻译内容
            translation: item.Phrase || ""
        }));

        const TLdetail : IEpisodeTranslateModel = {
            translator: "AI翻译",
            translateDetail: translateDetail
        };
        
        return translateDetail.length > 0 ? TLdetail : void 0;
    }
    
    return void 0;
}
