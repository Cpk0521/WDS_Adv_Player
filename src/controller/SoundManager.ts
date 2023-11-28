import { Assets } from '@pixi/assets'
import { IMediaInstance, sound, Sound} from '@pixi/sound'
import { IEpisodeSound } from '../types/Episode';
import { IController } from '../types/View';

export class SoundManager implements IController{
    
    protected _voiceDuration : number = 0;
    protected _currentBgm : Sound | undefined | null = null;
    protected _currentVoice : Sound | undefined | null = null;
    protected _currentSe : Sound | undefined | null = null;
    protected _onVoiceEnd : Function[] = [];

    static new(){
        return new this()
    }

    constructor(){
        sound.disableAutoPause = true;
        sound.volumeAll = 0.1;
    }

    public reset() {
        if (this._currentVoice) {
            this._currentVoice.stop();
            this._currentVoice = null;
        }

        if (this._currentBgm) {
            this._currentBgm.stop();
            this._currentBgm = null;
        }
        
        if (this._currentSe) {
            this._currentSe.stop();
            this._currentSe = null;
        }

        this._onVoiceEnd = [];
        this._voiceDuration = 0;
    }

    execute({
        BgmFileName,
        SeFileName,
        VoiceFileName
    } : IEpisodeSound){

        this._voiceDuration = 0;

        this._currentSe?.stop();
        this._currentVoice?.stop();
        
        if (BgmFileName) {
            this._playBgm(BgmFileName);
        }

        if (SeFileName) {
            this._playSe(SeFileName);
        }

        if (VoiceFileName) {
            this._playVoice(VoiceFileName);
        }
    };

    _playBgm(FileName : string){
        if(FileName === '999'){
            this._currentBgm?.stop(); 
            return
        }

        if(Assets.cache.has(`bgm_${FileName}`)){
            this._currentBgm = Assets.get(`bgm_${FileName}`);
            this._currentBgm?.play({
                loop: true,
                singleInstance: true,
                volume: 0.6,
            });
        }
    }

    _playSe(FileName : string){
        if(Assets.cache.has(`se_${FileName}`)){
            this._currentSe = Assets.get(`se_${FileName}`);
            this._currentSe?.play();
        }
    }

    _playVoice(FileName : string){
        if(Assets.cache.has(`voice_${FileName}`)){
            this._currentVoice = Assets.get(`voice_${FileName}`);
            let instance = this._currentVoice?.play();
            this._voiceDuration = (this._currentVoice?.duration ?? 0) * 1000;

            (instance as IMediaInstance).on('end', () => {
                this._onVoiceEnd.forEach(func => func())
                this._onVoiceEnd = [];
                this._currentVoice = null;
            })
        }
    }

    get voiceDuration(){
        return this._voiceDuration;
    }

    get onVoiceEnd(){
        return this._onVoiceEnd;
    }
    

}