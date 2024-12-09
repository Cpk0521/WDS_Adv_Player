import { Sprite, Container, Text, Texture, NineSliceSprite  } from 'pixi.js';
import { Tween } from 'tweedle.js';
import { IView } from "../types/View";
import { IEpisodeText } from "../types/Episode";
import { baseAssets } from '../constant/advConstant';

export class TextView extends IView {

    protected _textPanelContainer = new Container();
    protected _sprakerText : Text;
    protected _phrase : Text;
    protected _nextIcon : Sprite; //小三角形圖標
    // animation
    protected _nextIconAnimtor : Tween<any>; //小三角形圖標上下浮動動畫
    protected _allowNextIconDisplay : boolean = true; 
    protected _typingEffect : number | NodeJS.Timeout | undefined;
    protected _typingTotalDuration : number = 0;
    //Transalte
    protected _isTranslate : boolean = false;
    protected _fontFamilies : string[] = ['Ronowstd Gbs'];
    protected _currenttext : Partial<Pick<IEpisodeText, 'SpeakerName' | 'Phrase' | 'TLPhrase' | 'TLSpeakerName'>> = {}
    
    constructor(){
        super();
        this._textPanelContainer.sortableChildren = true;
        this.addChild(this._textPanelContainer);
        this._textPanelContainer.alpha = 0;

        //phrase text background
        const panel_texture = Texture.from(baseAssets.serif_window_bg)
        const PhraseTextBox = new NineSliceSprite({
            texture : panel_texture,
            leftWidth : 68,
            topHeight : 100,
            rightWidth : 68,
            bottomHeight : 100,
            width : 1628,
            height : 248
        });
        this._textPanelContainer.addChild(PhraseTextBox);
        this._textPanelContainer.x = (1920 - PhraseTextBox.width) / 2;
        this._textPanelContainer.y = 808 //(1080 / 2) + ((PhraseTextBox.height / 2) + 148);

        //phrase text
        this._phrase = new Text({
            text : '', 
            style : {
                fill: "#4a424b",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 40,
                leading: 4,
                lineHeight : 50,
                letterSpacing: -1,
            }
        });
        this._textPanelContainer.addChild(this._phrase);
        this._phrase.x = 93.5;
        this._phrase.y = 76-2;

        //spraker background
        const name_panel_texture = Texture.from(baseAssets.name_bg)
        const name_bg = new NineSliceSprite({
            texture : name_panel_texture,
            leftWidth : 75,
            topHeight : 0,
            rightWidth : 70,
            bottomHeight : 0,
            width : 400,
            height : 80
        });
        this._textPanelContainer.addChild(name_bg);
        name_bg.x = 188 - (name_bg.width / 2);
        name_bg.y = -20;

        //spraker label
        this._sprakerText = new Text({
            text : '', 
            style : {
                fill: "#ffffff",
                fontFamily : 'Ronowstd Gbs',
                fontSize : 40,
                letterSpacing: -1,
                // fontVariant : 'small-caps'
            }
        });
        this._textPanelContainer.addChild(this._sprakerText);
        this._sprakerText.anchor.set(0.5);
        this._sprakerText.x = 188;
        this._sprakerText.y = 10; //10-2.5;

        //nextIcon
        this._nextIcon = Sprite.from(baseAssets.icon_next);
        this._textPanelContainer.addChild(this._nextIcon);
        this._nextIcon.anchor.set(.5);
        this._nextIcon.position.set(1566, 195); //to 210
        this._nextIcon.alpha = 0;
        this._nextIconAnimtor = new Tween(this._nextIcon.position).to({y : 210}, 700).repeat().yoyo();
        
    }

    public clear(): void {
        this._textPanelContainer.alpha = 0;
        this._fontFamilies = ['Ronowstd Gbs'];
        this._currenttext = {};
    }

    static new(){
        return new this();
    }

    execute({
        Order,
        SpeakerName,
        Phrase,
        TLPhrase,
        TLSpeakerName
    } : IEpisodeText){

        if(!SpeakerName && Phrase.length === 0){
            this._typingTotalDuration = 0;
            // return this._hideTextPanelAnimation();
            this.hideTextPanel();
            return;
        }

        if(TLPhrase || TLSpeakerName){
            this._currenttext = { 
                SpeakerName, 
                TLSpeakerName, 
                Phrase: Order > 1 ? `${this._currenttext.Phrase}\n${Phrase}` : Phrase, 
                TLPhrase: Order > 1 ? `${this._currenttext.TLPhrase}\n${TLPhrase}` : TLPhrase
            };
        }

        if(this._textPanelContainer.alpha === 0){
            this.showTextPanelAnimation();
            // this.showTextPanel();
        }
        
        //next icon
        this._nextIcon.alpha = 0;
        this._nextIconAnimtor?.stop();

        //speaker text
        this._sprakerText.text = (this._isTranslate ? TLSpeakerName : SpeakerName) ?? '';
        this._sprakerText.style.fontSize = this._sprakerText.width >= 275 ? 35 : 40;
        this._sprakerText.style.fontFamily = (this._isTranslate ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
        
        //phrase text
        this._phrase.style.fontFamily = (this._isTranslate ? this._fontFamilies[1] : this._fontFamilies[0]) || this._fontFamilies[0];
        this._phrase.text = Order > 1 ? `${this._phrase.text}\n` : '';

        this._typingTotalDuration = Phrase.length * 50 + 500;

        let phrase = this._isTranslate ? TLPhrase!.replaceAll('/n', '\n')  : Phrase.replaceAll('/n', '\n') ;
        let phrase_index = 0;
        if(this._typingEffect){
            clearInterval(this._typingEffect);
            this._typingEffect = void 0;
        }
        this._typingEffect = setInterval(()=>{
            if(phrase_index === phrase.length){
                this._allowNextIconDisplay && this._playNextIconAnim(); //order check?
                clearInterval(this._typingEffect);
                this._typingEffect = void 0;
            }
            this._phrase.text += phrase.charAt(phrase_index);
            phrase_index ++;
        }, 50)
    }

    toggleTextContent(){
        if(this._typingEffect){
            clearInterval(this._typingEffect);
            this._typingEffect = void 0;
        }

        this._sprakerText.text = (this._isTranslate ? this._currenttext.TLSpeakerName : this._currenttext.SpeakerName) || '';
        this._sprakerText.style.fontFamily = this._isTranslate ? this._fontFamilies[1] : this._fontFamilies[0];

        this._phrase.text = (this._isTranslate ? this._currenttext.TLPhrase : this._currenttext.Phrase)?.replaceAll('/n', '\n') || '';
        this._phrase.style.fontFamily = this._isTranslate ? this._fontFamilies[1] : this._fontFamilies[0];
    }
    
    addFontFamily(family : string){
        if(!this._fontFamilies.includes(family)){
            this._fontFamilies.push(family);
        }
    }

    hideTextPanelAnimation(){
        if(this._textPanelContainer.alpha === 1){
            return new Promise<void>((res, _) => {
                new Tween(this._textPanelContainer).to({alpha : 0}, 100).start();
                setTimeout(() => {
                    res();
                }, 250);
            })
        }
    }

    showTextPanelAnimation(){
        new Tween(this._textPanelContainer).to({alpha : 1}, 100).start();
    }

    hideTextPanel(){
        this._textPanelContainer.alpha = 0;
    }

    showTextPanel(){
        this._textPanelContainer.alpha = 1;
    }
    
    _playNextIconAnim(){
        this._nextIcon.alpha = 1;
        this._nextIcon.y = 195;
        this._nextIconAnimtor?.start();
    }

    get typingTotalDuration(){
        return this._typingTotalDuration;
    }

    set allowNextIconDisplay(bool : boolean){
        this._allowNextIconDisplay = bool;
    }

    get isTranslate(){
        return this._isTranslate;
    }

    set isTranslate(bool : boolean){
        this._isTranslate = bool;
    }

}