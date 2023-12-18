import { Container } from "@pixi/display"
import { IEpisodeDetail } from "./Episode";

export interface IViewController {
    execute<T extends IEpisodeDetail>(arr : T): any
}

export abstract class IView extends Container{
    
    public addTo<T extends Container>(parent : T, order? : number): this {
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
    
    public abstract clear(): void
}

