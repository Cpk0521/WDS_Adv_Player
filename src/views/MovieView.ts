import { Sprite, Assets } from "pixi.js";
import { episodeExecutable, IView } from "../types/View";
import { IEpisodeMovie } from "../types/Episode";

export class MovieView extends IView implements episodeExecutable{

    protected _currentMovie : Sprite | undefined

    public execute({ MovieFileName }: IEpisodeMovie) {
        if(!MovieFileName){
            this.clear();
            return;
        }

        let texture = Assets.get(`movie_${MovieFileName}`);
        this._currentMovie = new Sprite(texture);

        const videoElement = (this._currentMovie.texture.source.resource as HTMLVideoElement);
        videoElement.muted = false;
        videoElement.loop = false;
        // videoElement.currentTime = 0;
        // videoElement.pause()

        return () => {
            if(this._currentMovie) this.addChild(this._currentMovie);
            videoElement.play();

            return new Promise<void>((res, _) => {
                videoElement.onended = () => {
                    this.removeChild(this._currentMovie!);
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