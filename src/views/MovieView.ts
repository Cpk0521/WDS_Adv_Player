import { Container } from "@pixi/display";
import { IController, IView } from "../types/View";
import { Sprite } from "@pixi/sprite";
import { Assets } from "@pixi/assets";
import { Texture, VideoResource } from "@pixi/core";
import { IEpisodeMovie } from "../types/Episode";

export class MovieView extends IView implements IController{

    protected _currentMovie! : any

    public execute({ MovieFileName }: IEpisodeMovie) {
        if(!MovieFileName) return

        let texture = Assets.get(`movie_${MovieFileName}`);
        this._currentMovie = new Sprite(texture);

        this.addChild(this._currentMovie);

        const controller = (this._currentMovie.texture as Texture<VideoResource>).baseTexture.resource.source;
        return controller.play().then(()=>{
            this.removeChild(this._currentMovie);
            this.hide()
        });
    }
    
    pauseMovie(){
        if(this._currentMovie){
            const controller = (this._currentMovie.texture as Texture<VideoResource>).baseTexture.resource.source;
            controller.pause();
        }
    }

}