import { Assets, Container, TilingSprite, Sprite, Texture, Ticker, Graphics, AnimatedSprite, BLEND_MODES, SpriteMaskFilter} from "pixi.js";
import { createEmptySprite } from "../utils/emptySprite";
import { baseAssets } from "../constant/advConstant";
import { Tween } from "tweedle.js";
import { IView } from "../types/View";

export class CoverOpening extends IView {

    protected ptn_bg : TilingSprite;
    protected _anim_jugon : AnimatedSprite;
    protected _animation : Tween<any>;
    
    constructor(){
        super();

        this.addChild(createEmptySprite({}));

        this.ptn_bg = new TilingSprite(Texture.from(baseAssets.bg_pattern), 2200, 1860);
        this.ptn_bg.anchor.set(0.5);
        this.ptn_bg.position.set(1920/2, 1080/2);
        this.ptn_bg.angle = -30;
        this.addChild(this.ptn_bg);

        Ticker.shared.add(this._BGupdate, this);

        let graphics = new Graphics();
        graphics.lineStyle(5, 0x4e4c5e, 1);
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawRect(-(1920/2) -10, -(410/2) , 1940, 410);
        graphics.endFill();
        graphics.position.set(1920/2, 1080/2)
        this.addChild(graphics);
        graphics.height = 0;
        let graphicsAnim = new Tween(graphics).to({height : 410 }, 500)
        
        const jugonArr = [
            Texture.from(baseAssets.illust_jugon_1),
            Texture.from(baseAssets.illust_jugon_2),
            Texture.from(baseAssets.illust_jugon_3),
        ]

        this._anim_jugon = new AnimatedSprite(jugonArr);
        this._anim_jugon.position.set(1030, 305);
        this.addChild(this._anim_jugon)
        this._anim_jugon.anchor.set(0.5);
        this._anim_jugon.animationSpeed = .13;
        this._anim_jugon.alpha = 0
        let anim_jugon_Anim = new Tween(this._anim_jugon)
            .to({alpha : 1 , position : {x : 1920/2}}, 1000)
            .onStart(()=>{
                this._anim_jugon.play();
            })

        let touchText = new Sprite(Texture.from(baseAssets.tap_to_start));
		touchText.anchor.set(0.5);
		touchText.position.set(1920/2, 915);
        touchText.alpha = 0;
        this.addChild(touchText);
        let touch_Anim = new Tween(touchText)
            .to({alpha : 1 }, 1500)
            .repeat()
            .yoyo()
            .onStart(()=>{
                this.eventMode = 'dynamic';
                this.cursor = 'pointer';
            });

        this._animation = graphicsAnim.chain(anim_jugon_Anim)
        anim_jugon_Anim.chain(touch_Anim)
        
        // const gr1 = new Graphics();
        // gr1.beginFill(0x000000, 1);
        // gr1.drawRect(0, 0, 1920, 1080);
        // gr1.endFill();

        // const gr  = new Graphics();
        // gr.beginFill(0xffffff, 0);
        // gr.drawCircle(1920/2, 1080/2, 500);
        // gr.endFill();
        // // gr.position.set(1920/2, 1080/2)

        // gr1.mask = gr;
        // this.mask = gr1
        // this.addChild(masksprite)
    }

    static new(){
        return new this();
    }
    
    hide(){
        this.visible = false;
        Ticker.shared.remove(this._BGupdate, this);
        this._anim_jugon.stop();
        this._animation.stop();
        this._animation.stopChainedTweens();
        // this.destroy(true);
    }

    start(){
        this._animation.start();
    }

    _BGupdate(){
        this.ptn_bg.tilePosition.x += 1
    }

}