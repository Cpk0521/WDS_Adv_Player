import { Sprite, Assets } from "pixi.js";
import { IView } from "../types/View";
import { IEpisodeMovie } from "../types/Episode";

export class MovieView extends IView {

    protected _currentMovie : Sprite | undefined

    public execute({ MovieFileName }: IEpisodeMovie) {        
        if(!MovieFileName) return;

        let texture = Assets.get(`movie_${MovieFileName}`);
        this._currentMovie = new Sprite(texture);

        const videoElement = (this._currentMovie.texture.source.resource as HTMLVideoElement);

        return () => {
            if(this._currentMovie) this.addChild(this._currentMovie); //play the video
            return new Promise<void>((res, _) => {
                videoElement.onended = () => {
                    this.removeChild(this._currentMovie!);
                    this.hide();
                    res();
                }
            })
        }
    }
    
    public clear(): void {
        this.pauseMovie();
        this.removeChildren();
        this._currentMovie && this._currentMovie.destroy();
    }

    pauseMovie(){
        if(this._currentMovie){
            const videoElement = this._currentMovie.texture.source.resource as HTMLVideoElement;
            videoElement.pause();
        }
    }

}