import { Text, TilingSprite, Sprite, Texture, Ticker, Graphics, AnimatedSprite, Filter, Container } from "pixi.js";
import { Tween } from "tweedle.js";
import { StoryTypes } from "../types/Episode";
import { IEpisodeTranslateModel } from '../controller/translationController'
import { createEmptySprite } from "../utils/emptySprite";
import { baseAssets } from "../constant/advConstant";
import fragmentShader from '../shader/circleShader.frag?raw';

type CoverOpeningProps = {
    type : StoryTypes;
    chapter: string;
    title : string;
    order : number;
} 
& Partial<Omit<IEpisodeTranslateModel, 'translateDetail'>>

export class CoverOpening extends Container {

    protected ptn_bg : TilingSprite;
    protected _anim_jugon : AnimatedSprite;
    protected _animation : Tween<any>;
    protected _touch_Animation : Tween<any>;
    protected _locked : boolean = false;
    //text
    protected _top_text : Text;
    protected _middle_text : Text;
    protected _bottom_text : Text;
    protected _percent_text : Text;
    protected _info_text : Text;
    //Transalte
    protected _fontFamilies : string[] = ['Ronowstd Gbs'];
    
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

        const anim_arr :　Tween<any>[] = [];
        
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
        this._percent_text = new Text('', {
            fill: "#4a424b",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 50,
            leading: 4,
            letterSpacing: -1,
        });
        this._percent_text.anchor.set(1, 0.5);
		this._percent_text.position.set(1920 - 120, 1080 - 80);
        this.addChild(this._percent_text);

        this._info_text = new Text('', {
            fill: "#4a424b",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 45,
            leading: 4,
            letterSpacing: -1,
        })
        this._info_text.x = 1920/2;
        this._info_text.y = 775;
        this._info_text.anchor.set(.5);
        this._info_text.alpha = 0;
        this.addChild(this._info_text);
        anim_arr.push(new Tween(this._info_text).to({alpha : 1}, 1000));

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

    public addTo<T extends Container>(parent : T, order? : number): this {
        parent.addChild(this);
        if(order && parent.sortableChildren){
            this.zIndex = order;
        }
        return this;
    }

    static new(){
        return new this();
    }

    addFontFamily(family : string){
        if(!this._fontFamilies.includes(family)){
            this._fontFamilies.push(family);
        }
    }

    init({type, chapter, title, order, TLTitle, info} : CoverOpeningProps){
        //text
        if(type === StoryTypes.Main || type === StoryTypes.Event){
            this._top_text.text = chapter;
            this._middle_text.text = `第　${order}　話`;
            this._bottom_text.text = !!TLTitle ?  `${TLTitle}` : `${title}`;
            this._bottom_text.style.fontFamily = (!!TLTitle ? this._fontFamilies[0] : this._fontFamilies[1]) || this._fontFamilies[0];
        }

        if(type === StoryTypes.Side){
            //side`
            this._top_text.text = `サイドストーリー${order == 1 ? '(前編)' : '(後編)'}`;
            this._middle_text.text = !!TLTitle ? `${TLTitle}` : `${title}`;
            this._middle_text.style.fontFamily = (!!TLTitle ? this._fontFamilies[0] : this._fontFamilies[1]) || this._fontFamilies[0];
        }

        //info
        if(info){
            this._info_text.text = `${info}`;
            this._info_text.style.fontFamily = this._fontFamilies[1] || this._fontFamilies[0];
        }

        this._animation.start();
    }

    progress(percent : number){
        if(this._locked) return;
        const text = `${percent} %`
        if(percent === 100){
            this._percent_text.alpha = 0;
            this._touch_Animation.start();
            return;
        }
        
        this._percent_text.text = text;
    }

    error(error? : any){
        this._locked = true;
        this._percent_text.style.fill = 0xFF0000;
        this._percent_text.text = error ? `ERROR : ${error}` : 'ERROR';
    }

    log(text : string){    
        this._percent_text.style.fill = 0x4a424b;
        this._percent_text.text = text;
    }
    
    close(callback? : Function){
        const shaderFilter = new Filter(undefined, fragmentShader, {
            uTime: 0,
            u_resolution: [1920, 1080],
        })
        this.filters = [shaderFilter];

        return new Tween(shaderFilter.uniforms)
            .to({ uTime: 1 }, 600)
            .onComplete(()=>{
                shaderFilter.enabled = false; //turn off shader
                shaderFilter.destroy(); //destroy shader
                this.visible = false; 
                Ticker.shared.remove(this._BGupdate, this);
                this._anim_jugon.stop();
                this._touch_Animation.stop();
                this.destroy(true);
                callback?.();
            })
            .start();
    }

    _BGupdate(){
        this.ptn_bg.tilePosition.x += 1
    }

}