import { Assets, AssetsBundle, ProgressCallback, UnresolvedAsset } from "pixi.js";
import "@pixi/sound";
import '@esotericsoftware/spine-pixi-v8'
import './PackLoader'
import resPath from "./resPath";
import { IEpisodeModel } from "../types/Episode";
import { parse } from 'papaparse'
import { IEpisodeTranslateUnit, IEpisodeTranslateModel } from "../types/translation";


export async function loadJson<T extends Object>(source : string) : Promise<T>{
    return fetch(source)
        .then(response => {
            if(response.status === 429) {
                console.warn("Rate limited! Code 429 encountered.");
                throw new Error(response.statusText);
            }

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
    
    const resources = [] as UnresolvedAsset[];

    const bgmlist = await loadJson<string[]>(resPath.bgmMaster);
    const selist = await loadJson<string[]>(resPath.seMaster);

    episodeTrack.EpisodeDetail.forEach((unit) => {
        //Backgorund
        if (unit.BackgroundImageFileName) {
            if(!resources.some(res => res.alias === `bg_${unit.BackgroundImageFileName}`)){
                resources.push({
                    alias : `bg_${unit.BackgroundImageFileName}`,
                    src : resPath.background(unit.BackgroundImageFileName)
                })
            }
        }

        //CharacterImages
        if (unit.BackgroundCharacterImageFileName) {
            if(!resources.some(res => res.alias === `card_${unit.BackgroundCharacterImageFileName}`)){
                resources.push({
                    alias : `card_${unit.BackgroundCharacterImageFileName}`,
                    src : resPath.cards(unit.BackgroundCharacterImageFileName)
                })
            }
        }

        //still
        if (unit.StillPhotoFileName) {
            if(!resources.some(res => res.alias === `still_${unit.StillPhotoFileName}`)){
                resources.push({
                    alias : `still_${unit.StillPhotoFileName}`,
                    src : resPath.still(unit.StillPhotoFileName)
                })
            }
        }

        //movie
        if (unit.MovieFileName) {
            if(!resources.some(res => res.alias === `movie_${unit.MovieFileName}`)){
                resources.push({
                    alias : `movie_${unit.MovieFileName}`,
                    src : resPath.movie(unit.MovieFileName),
                    data : {
                        autoPlay : false
                    }
                })
            }
        }

        //bgm
        if (unit.BgmFileName) {
            if (
                bgmlist.includes(unit.BgmFileName) &&
                unit.BgmFileName != "999" &&
                !resources.some(res => res.alias === `bgm_${unit.BgmFileName}`)
            ) {
                resources.push({
                    alias : `bgm_${unit.BgmFileName}`,
                    src : resPath.bgm(unit.BgmFileName),
                })
            }
        }

        //Se
        if (unit.SeFileName) {
            if (
                selist.includes(unit.SeFileName) &&
                !resources.some(res => res.alias === `se_${unit.SeFileName}`)
            ) {
                resources.push({
                    alias : `se_${unit.SeFileName}`,
                    src : resPath.se(unit.SeFileName),
                });
            }
        }

        //spine
        unit.CharacterMotions.forEach((motion) => {
            if (motion.SpineId != 0 && !resources.some(res => res.alias === `spine_${motion.SpineId}`)) {
                resources.push({
                    alias : `spine_${motion.SpineId}`,
                    src : resPath.spine(motion.SpineId),
                });
                resources.push({
                    alias : `spine_atlas_${motion.SpineId}`,
                    src : resPath.spine_atlas( motion.SpineId),
                });
            }
        });
    });

    // voice
    if (isVoice) {
        resources.push({
            alias : `voicepack_${episodeTrack.EpisodeId}`,
            src : resPath.voicePack(episodeTrack.EpisodeId),
            data : {
                onerror : () => {isVoice = false},
                strategy: 'skip',
            }
        });
    }

    Assets.addBundle(`${episodeTrack.EpisodeId}_bundle`, resources);
    await Assets.loadBundle(`${episodeTrack.EpisodeId}_bundle`, callback);

    return {
        isVoice: isVoice,
        resources: resources,
    }
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