import { baseAssetsUrl } from "../constant/advConstant"

export const resPath = {
    bgmMaster : `${baseAssetsUrl}/BGMMasterlist.json`, 
    seMaster : `${baseAssetsUrl}/SEMasterlist.json`, 
    advJson : (epId : number | string) => `${baseAssetsUrl}/episode/${epId}.json`,
    spine : (spineId : number) => `${baseAssetsUrl}/spine/${spineId}.skel`,
    background : (name : string) => `${baseAssetsUrl}/background/${name}.png`,
    cards : (charId : string) => `${baseAssetsUrl}/cards/${charId}.png`,
    still : (label : string) => `${baseAssetsUrl}/still/${label}.png`,
    movie : (name : string) => `${baseAssetsUrl}/movie/${name}.mp4`,
    manifest : (EpisodeMasterId: number) => `${baseAssetsUrl}/voice/${EpisodeMasterId}/manifest.json`,
    voice : (EpisodeMasterId: number, voiceId : string) => `${baseAssetsUrl}/voice/${EpisodeMasterId}/${voiceId}.mp3`,
    bgm : (bgmId : string) => `${baseAssetsUrl}/bgm/${bgmId}.mp3`,
    se : (seId : string) => `${baseAssetsUrl}/se/${seId}.mp3`,
}

export default resPath