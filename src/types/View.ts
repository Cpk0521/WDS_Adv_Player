import { Container } from "@pixi/display"

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
    
    public clear(): void {}
}

