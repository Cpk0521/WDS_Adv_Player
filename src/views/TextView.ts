import { Sprite, Container, Text, TextStyle, NineSlicePlane, Texture } from 'pixi.js';
import { IController, IView } from "../types/View";
import { FontSizes, IEpisodeText } from "../types/Episode";
import { baseAssets, advConstant} from '../constant/advConstant';
import { Tween } from 'tweedle.js';

export class TextView extends IView implements IController{

    protected _textPanelContainer = new Container();
    protected _sprakerText : Text;
    protected _phrase : Text;
    protected _nextIcon : Sprite;
    protected _nextIconAnimtor : Tween<any>;
    protected _typingEffect : number | NodeJS.Timeout | undefined;
    protected readonly _fontSize = [
        {
            fontsize : FontSizes.Small,
            size : advConstant.SmallFontSize,
        },
        {
            fontsize : FontSizes.Middle,
            size : advConstant.MiddleFontSize,
        },
        {
            fontsize : FontSizes.Large,
            size : advConstant.LargeFontSize
        }
    ]
    
    constructor(){
        super();
        this._textPanelContainer.sortableChildren = true;
        this.addChild(this._textPanelContainer);
        this._textPanelContainer.alpha = 0;

        //phrase text background
        const panel_texture = Texture.from(baseAssets.serif_window_bg)
        const PhraseTextBox = new NineSlicePlane(panel_texture, 68, 120, 68, 120);
        this._textPanelContainer.addChild(PhraseTextBox);
        PhraseTextBox.width = 1628;
        PhraseTextBox.height = 248;
        PhraseTextBox.x = (1920 - PhraseTextBox.width) / 2;
        PhraseTextBox.y = 808 //(1080 / 2) + ((PhraseTextBox.height / 2) + 148);

        //phrase text
        this._phrase = new Text('', new TextStyle({
            fill: "#4a424b",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 40,
            leading: 4,
            letterSpacing: -1,
        }));
        PhraseTextBox.addChild(this._phrase);
        this._phrase.x = 93.5;
        this._phrase.y = 76;

        //spraker background
        const name_panel_texture = Texture.from(baseAssets.name_bg)
        const name_bg = new NineSlicePlane(name_panel_texture, 56, 0, 19, 62);
        PhraseTextBox.addChild(name_bg);
        name_bg.width = 400;
        name_bg.height = 80;
        name_bg.x = 188 - (name_bg.width / 2);
        name_bg.y = -20;

        //spraker label
        this._sprakerText = new Text('', new TextStyle({
            fill: "#ffffff",
            fontFamily : 'Ronowstd Gbs',
            fontSize : 40,
            letterSpacing: -1,
        }));
        name_bg.addChild(this._sprakerText);
        this._sprakerText.anchor.set(0.5);
        this._sprakerText.x = 200;
        this._sprakerText.y = 30;

        //nextIcon
        this._nextIcon = Sprite.from(baseAssets.icon_next);
        PhraseTextBox.addChild(this._nextIcon)
        this._nextIcon.anchor.set(.5);
        this._nextIcon.position.set(1566, 195); //to 210
        this._nextIcon.alpha = 0;
        this._nextIconAnimtor = new Tween(this._nextIcon.position).to({y : 210}, 700).repeat().yoyo();
        
    }

    static new(){
        return new this();
    }

    execute({
        SpeakerName,
        Phrase,
        // FontSize
    } : IEpisodeText){
        
        if(!SpeakerName){
            return this._hideTextPanel();
        }

        if(this._textPanelContainer.alpha === 0){
            this._showTextPanel();
        }
        
        //next
        this._nextIcon.alpha = 0;
        this._nextIconAnimtor?.stop();

        //text
        this._sprakerText.text = SpeakerName ?? '';
        this._phrase.text = '';

        let phrase = Phrase.replace('/n', '\n');
        let phrase_index = 0;
        if(this._typingEffect){
            clearInterval(this._typingEffect);
            this._typingEffect = undefined;
        }
        this._typingEffect = setInterval(()=>{
            if(phrase_index === phrase.length){
                this._playNextIconAnim();
                clearInterval(this._typingEffect);
                this._typingEffect = undefined;
            }
            this._phrase.text += phrase.charAt(phrase_index);
            phrase_index ++;
        }, 50)
    }

    _hideTextPanel(){        
        new Tween(this._textPanelContainer).to({alpha : 0}, 100).start();
    }

    _showTextPanel(){
        new Tween(this._textPanelContainer).to({alpha : 1}, 100).start();
    }
    
    _playNextIconAnim(){
        this._nextIcon.alpha = 1;
        this._nextIcon.y = 195;
        this._nextIconAnimtor?.start();
    }

}