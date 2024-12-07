import { Assets, AlphaFilter, Graphics} from "pixi.js";
import { Tween } from "tweedle.js";
import { Spine } from '@esotericsoftware/spine-pixi';
import { baseAssets } from "../constant/advConstant";

export class AdvTimeElapsedAnimation extends Graphics{

    protected _jugon : Spine | undefined;
    protected aplha_filter = new AlphaFilter();
    protected _spineDuratinon = 3400;
    
    constructor(){
        super();
        this.beginFill(0xffffff);
        this.drawRect(0, 0, 1920, 1080);
        this.alpha = 0;

        Assets.load([baseAssets.jugon_progress, baseAssets.jugon_progress_atlas]).then(()=>{
            this._jugon = Spine.from(baseAssets.jugon_progress, baseAssets.jugon_progress_atlas);
            this._jugon.scale.set(.25);
            this._jugon.visible = false;
            this.addChild(this._jugon);

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
        return new Tween(this)
            .to({alpha : 1}, 400)
            .onComplete(()=>{
                this._jugon!.visible = true;
                this._jugon!.state.setAnimation(0, "animation", false);
            })
    }

    _hide(){
        new Tween(this.aplha_filter)
            .to({alpha : 0}, 300)
            .chain(new Tween(this)
                .to({alpha : 0}, 300)
                .delay(800)
                .onComplete(()=>{
                    this._jugon!.visible = false;
                })
                .start()
            )
            .start();
    }

    get totalDuration(){
        return 400 + this._spineDuratinon + 1200;
    }
}
