import { Assets, AlphaFilter, Graphics} from "pixi.js";
import { Tween } from "tweedle.js";
import '@pixi-spine/loader-uni';
import { Spine } from '@pixi-spine/runtime-4.1';
import { baseAssets } from "../constant/advConstant";

export class JugonFadePanel extends Graphics{

    protected _jugon : Spine | undefined;
    protected aplha_filter = new AlphaFilter();

    constructor(){
        super();
        this.beginFill(0xffffff);
        this.drawRect(0, 0, 1920, 1080);
        this.alpha = 0;

        Assets.load(baseAssets.jugon_progress).then((asset)=>{
            this._jugon = new Spine(asset.spineData);
            this.addChild(this._jugon);
            this._jugon.visible = false;
            this._jugon.scale.set(.25);
            let jugon_height = this._jugon.getBounds().height;
            this._jugon.position.set(1920 / 2, 1080 / 2 + (jugon_height/2));
            this._jugon.filters = [this.aplha_filter];
            this._jugon.state.addListener({
                complete :() => this._hide(),
            })
        })
    }

    static create(){
        return new this();
    }

    get FadeIn(){
        return new Tween(this).to({alpha : 1}, 800).onComplete(()=>{
            this._jugon!.visible = true;
            this._jugon!.state.setAnimation(0, "animation", false); 
        })
    }

    _hide(){
        let jugonhide =  new Tween(this.aplha_filter).to({alpha : 0}, 800).start();
        jugonhide.chain(
            new Tween(this)
                .to({alpha : 0}, 800)
                .delay(1200)
                .onComplete(()=>{
                    this._jugon!.visible = false;
                })
                .start())
    }
}
