import { Text, TilingSprite, Sprite, Texture, Ticker, Graphics, AnimatedSprite, BLEND_MODES } from "pixi.js";
import { Tween } from "tweedle.js";
import { IView } from "../types/View";
import { StoryTypes } from "../types/Episode";
import { createEmptySprite } from "../utils/emptySprite";
import { baseAssets } from "../constant/advConstant";

export class CoverOpening extends IView {

    protected ptn_bg : TilingSprite;
    protected _anim_jugon : AnimatedSprite;
    protected _animation : Tween<any>;
    protected _touch_Animation : Tween<any>;
    //text
    protected _top_text : Text;
    protected _middle_text : Text;
    protected _bottom_text : Text;
    // protected _anim_arr : Tween<any>[] = []
    
    constructor(){
        super();

        this.addChild(createEmptySprite({}));

        this.ptn_bg = new TilingSprite(Texture.from(baseAssets.bg_pattern), 2200, 1860);
        this.ptn_bg.anchor.set(0.5);
        this.ptn_bg.position.set(1920/2, 1080/2);
        this.ptn_bg.angle = -30;
        this.addChild(this.ptn_bg);

        Ticker.shared.add(this._BGupdate, this);

        const graphics = new Graphics();
        graphics.lineStyle(5, 0x4e4c5e, 1);
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawRect(-(1920/2) -10, -(410/2) , 1940, 410);
        graphics.endFill();
        graphics.position.set(1920/2, 530);
        graphics.scale.set(1);
        graphics.height = 0;
        this.addChild(graphics);
        const graphicsAnim = new Tween(graphics).to({height : 410 }, 500);

        const anim_arr = [];
        
        const jugonArr = [
            Texture.from(baseAssets.illust_jugon_1),
            Texture.from(baseAssets.illust_jugon_2),
            Texture.from(baseAssets.illust_jugon_3),
        ]

        this._anim_jugon = new AnimatedSprite(jugonArr);
        this._anim_jugon.position.set(1030, 290);
        this.addChild(this._anim_jugon);
        this._anim_jugon.scale.set(1.2);
        this._anim_jugon.anchor.set(0.5);
        this._anim_jugon.animationSpeed = .13;
        this._anim_jugon.alpha = 0
        const anim_jugon_Anim = new Tween(this._anim_jugon)
            .to({alpha : 1 , position : {x : 1920/2}}, 1000)
            .onStart(()=>{
                this._anim_jugon.play();
            })
        anim_arr.push(anim_jugon_Anim);

        const touchText = new Sprite(Texture.from(baseAssets.tap_to_start));
		touchText.anchor.set(0.5);
		touchText.position.set(1920/2, 915);
        touchText.alpha = 0;
        this.addChild(touchText);
        this._touch_Animation = new Tween(touchText)
            .to({alpha : 1 }, 1500)
            .repeat()
            .yoyo()
            .onStart(()=>{
                this.eventMode = 'dynamic';
                this.cursor = 'pointer';
            });
        
        
        //text
        this._top_text = new Text('', {
            fill: "#4a424b",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 41.5,
            leading: 4,
            letterSpacing: -1,
        });
        this._top_text.x = 1920/2;
        this._top_text.y = 410;
        this._top_text.anchor.set(.5);
        this._top_text.alpha = 0;
        this.addChild(this._top_text);
        anim_arr.push(new Tween(this._top_text).to({alpha : 1}, 1000));

        this._middle_text = new Text('', {
            fill: "#4a424b",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 100,
            leading: 4,
            letterSpacing: -1,
        });
        this._middle_text.x = 1920/2;
        this._middle_text.y = 530;
        this._middle_text.anchor.set(.5);
        this._middle_text.alpha = 0;
        this.addChild(this._middle_text);
        anim_arr.push(new Tween(this._middle_text).to({alpha : 1}, 1000));

        this._bottom_text = new Text('', {
            fill: "#4a424b",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 48.5,
            leading: 4,
            letterSpacing: -1,
        });
        this._bottom_text.x = 1920/2;
        this._bottom_text.y = 650;
        this._bottom_text.anchor.set(.5);
        this._bottom_text.alpha = 0;
        this.addChild(this._bottom_text);
        anim_arr.push(new Tween(this._bottom_text).to({alpha : 1}, 1000));

        this._animation = graphicsAnim.chain(...anim_arr);
    }

    public clear(): void {
        
    }

    static new(){
        return new this();
    }

    init(type : StoryTypes, title : string, order : number){
        //text
        if(type === StoryTypes.Main || type === StoryTypes.Event){
            this._top_text.text = '';
            this._middle_text.text = `第　${order}　話`;
            this._bottom_text.text = title;
        }

        if(type === StoryTypes.Side){
            
        }
        
        this._animation.start();
    }

    start(){
        this._touch_Animation.start();
    }
    
    close(){
        this.visible = false;
        Ticker.shared.remove(this._BGupdate, this);
        this._anim_jugon.stop();
        this._touch_Animation.start();
        this.destroy(true);
    }

    _BGupdate(){
        this.ptn_bg.tilePosition.x += 1
    }

}