import { Container } from "pixi.js"
import { IEpisodeDetail } from "./Episode";

export abstract class IView extends Container{

    public addTo<T extends Container>(parent : T, order : number = 0): this {
        parent.addChild(this);
        if(order && parent.sortableChildren){
            this.zIndex = order;
        }
        return this;
    }

    public show(): void {
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }
    
    public clear(): void {
        throw new Error("Method not implemented.");
    }
}


export interface episodeExecutable {
    execute(parent : IEpisodeDetail): (() => Promise<void>) | undefined | void;
}
