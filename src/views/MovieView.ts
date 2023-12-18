import { Texture, VideoResource, Sprite, Assets } from "pixi.js";
import { IViewController, IView } from "../types/View";
import { IEpisodeMovie } from "../types/Episode";

export class MovieView extends IView implements IViewController{

    protected _currentMovie : Sprite | undefined

    public execute({ MovieFileName }: IEpisodeMovie) {
        if(!MovieFileName) return

        let texture = Assets.get(`movie_${MovieFileName}`);
        this._currentMovie = new Sprite(texture);

        this.addChild(this._currentMovie);

        const controller = (this._currentMovie.texture as Texture<VideoResource>).baseTexture.resource.source;
        return controller.play().then(()=>{
            this.removeChild(this._currentMovie!);
            this.hide()
        });
    }
    
    public clear(): void {
        this.pauseMovie();
        this.removeChildren();
        this._currentMovie && this._currentMovie.destroy();
    }

    pauseMovie(){
        if(this._currentMovie){
            const controller = (this._currentMovie.texture as Texture<VideoResource>).baseTexture.resource.source;
            controller.pause();
        }
    }

}