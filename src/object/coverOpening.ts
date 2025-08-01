import { Text, TilingSprite, Sprite, Texture, Ticker, Graphics, AnimatedSprite, Container } from "pixi.js";
import { Tween } from "tweedle.js";
import { StoryTypes } from "../types/Episode";
import { IEpisodeTranslateModel } from  "../types/translation";
import { createEmptySprite } from "../utils/emptySprite";
import { baseAssets } from "../constant/advConstant";

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

    protected _isauto: boolean = false;
    
    constructor(){
        super();

        this.addChild(createEmptySprite({}));

        this.ptn_bg = new TilingSprite({
            texture : Texture.from(baseAssets.bg_pattern), 
            width: 2200, 
            height: 1860
        });
        this.ptn_bg.anchor.set(0.5);
        this.ptn_bg.position.set(1920/2, 1080/2);
        this.ptn_bg.angle = -30;
        this.addChild(this.ptn_bg);

        Ticker.shared.add(this._BGupdate, this);

        const graphics = new Graphics();
        graphics
            .rect(-(1920/2) -10, -(410/2) , 1940, 410)
            .fill(0xFFFFFF)
            .stroke({
                width : 5,
                color : 0x4e4c5e,
            })
        graphics.position.set(1920/2, 530);
        graphics.scale.set(1);
        graphics.height = 0;
        this.addChild(graphics);
        const graphicsAnim = new Tween(graphics).to({height : 410 }, 500);

        const anim_arr : Tween<any>[] = [];
        
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
        this._percent_text = new Text({
            text :'',
            style : {
                fill: "#4a424b",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 50,
                leading: 4,
                letterSpacing: -1,
            }
        });
        this._percent_text.anchor.set(1, 0.5);
		this._percent_text.position.set(1920 - 120, 1080 - 80);
        this.addChild(this._percent_text);

        this._info_text = new Text({
            text : '', 
            style : {
                fill: "#4a424b",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 45,
                leading: 4,
                letterSpacing: -1,
            }
        })
        this._info_text.x = 1920/2;
        this._info_text.y = 745;
        this._info_text.anchor.set(.5, 0);
        this._info_text.alpha = 0;
        this.addChild(this._info_text);
        anim_arr.push(new Tween(this._info_text).to({alpha : 1}, 1000));

        this._top_text = new Text({
            text : '', 
            style :{
                fill: "#4a424b",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 41.5,
                leading: 4,
                letterSpacing: -1,
            }
        });
        this._top_text.x = 1920/2;
        this._top_text.y = 410;
        this._top_text.anchor.set(.5);
        this._top_text.alpha = 0;
        this.addChild(this._top_text);
        anim_arr.push(new Tween(this._top_text).to({alpha : 1}, 1000));

        this._middle_text = new Text({
            text : '', 
            style : {
                fill: "#4a424b",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 100,
                leading: 4,
                letterSpacing: -1,
            }
        });
        this._middle_text.x = 1920/2;
        this._middle_text.y = 530;
        this._middle_text.anchor.set(.5);
        this._middle_text.alpha = 0;
        this.addChild(this._middle_text);
        anim_arr.push(new Tween(this._middle_text).to({alpha : 1}, 1000));

        this._bottom_text = new Text({
            text : '', 
            style : {
                fill: "#4a424b",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 48.5,
                leading: 4,
                letterSpacing: -1,
            }
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

    public setAuto(value : boolean){
        this._isauto = value;
    }

    static new(){
        return new this();
    }

    addFontFamily(family : string){
        if(!this._fontFamilies.includes(family)){
            this._fontFamilies.push(family);
        }
    }

    init({type, chapter, title, order, TLTitle, info, TLChapter} : CoverOpeningProps){
        //Main or Event
        if(type === StoryTypes.Main || type === StoryTypes.Event){
            this._top_text.text = !!TLChapter ?  `${TLChapter}` : `${chapter}`;
            this._top_text.style.fontFamily = (!!TLChapter ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
            this._middle_text.text = `第　${order}　話`;
            this._bottom_text.text = !!TLTitle ?  `${TLTitle}` : `${title}`;
            this._bottom_text.style.fontFamily = (!!TLTitle ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
        }

        //side
        if(type === StoryTypes.Side){
            this._top_text.text = `サイドストーリー${order == 1 ? '(前編)' : '(後編)'}`;
            this._middle_text.text = !!TLTitle ? `${TLTitle}` : `${title}`;
            this._middle_text.style.fontFamily = (!!TLTitle ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
        }

        if(type === StoryTypes.Special){
            this._top_text.text = !!TLChapter ?  `${TLChapter}` : `${chapter}`;
            this._top_text.style.fontFamily = (!!TLChapter ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
            this._middle_text.text = !!TLTitle ? `${TLTitle}` : `${title}`;
            this._middle_text.style.fontFamily = (!!TLTitle ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
        }

        //info
        if(info){
            this._info_text.text = `${info.replaceAll('/n', '\n').replaceAll("\\n", '\n')}`;
            this._info_text.style.fontFamily = this._fontFamilies[1] || this._fontFamilies[0];
        }

        this._animation.start();
    }

    progress(percent : number){
        if(this._locked) return;
        const text = `${percent} %`
        if(percent === 100){
            this._percent_text.alpha = 0;
            if(!this._isauto){
                this._touch_Animation.start();
            }
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
        //由於webgpu要用wgsl frag只支持webgl 所以用v8的mask新功能代替
        const circleMask = new Graphics();
        circleMask.circle(0, 0, 1920/1.7).fill(0x000000);
        circleMask.position.set(1920/2, 1080/2);
        circleMask.scale.set(0); //有閃爍 可能是沒有設做0導致的
        this.setMask({
            mask: circleMask,
            inverse: true,
        });
        this.addChild(circleMask);
        new Tween(circleMask.scale)
            .to({x: 1, y: 1}, 600)
            .onComplete(()=>{
                this.visible = false; 
                Ticker.shared.remove(this._BGupdate, this);
                this._anim_jugon.stop();
                if(!this._isauto){
                    this._touch_Animation.stop();
                }
                this.destroy({children : true});
                callback?.();
            })
            .start();
    }

    _BGupdate(){
        this.ptn_bg.tilePosition.x += 1
    }

}