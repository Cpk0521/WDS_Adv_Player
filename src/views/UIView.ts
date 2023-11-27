import { Container, Sprite, Texture } from "pixi.js";
import { IView } from "../types/View";
import { baseAssets } from '../constant/advConstant'
import { Tween } from "tweedle.js";


class UIButton extends Sprite {

    protected _content : Sprite;
    protected _base_bg : Texture;
    protected _pressed_bg : Texture;
    protected _isPressed : boolean = false;
    protected _onPressed : Function = () => {};
    protected _config : any;

    constructor(contentIcon : Texture, base_bg : Texture, pressed_bg : Texture, config? : any){
        super(base_bg);

        this._content = new Sprite(contentIcon);
        this._base_bg = base_bg;
        this._pressed_bg = pressed_bg;
        this._config = config ?? {};

        this.addChild(this._content);
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this._onclick, this)
        this.anchor.set(0.5);

        this._content.anchor.set(0.5);
        this._content.tint = 0x4b4b4b;
    }

    static create(contentIcon : Texture, base_bg : Texture, pressed_bg : Texture, config? : any){
        return new this(contentIcon, base_bg, pressed_bg, config);
    }

    addTo<T extends Container>(parent : T){
        parent.addChild(this);
        return this;
    }

    pos(x : number, y : number){
        this.position.set(x, y);
        return this;
    }

    onPressed(callback : Function){
        this._onPressed = callback;
        return this;
    }
 
    _onclick(){
        this._isPressed = !this._isPressed;

        if(this._isPressed){
            this.texture = this._pressed_bg;
            this._content.tint = 0xffffff;
        }
        else{
            this.texture = this._base_bg;
            this._content.tint = 0x4b4b4b;
        }

        this._onPressed(this._isPressed);
    }

    get isPressed(){
        return this._isPressed;
    }

}



export class UIView extends IView {

    protected autoBtn : UIButton;

    constructor(){
        super();

        this.alpha = 0;

        //auto Button
        let autoIconTexture = Texture.from(baseAssets.icon_auto);
        let auto_bg = Texture.from(baseAssets.icon_bg_common);
        let auto_clicked_bg = Texture.from(baseAssets.icon_bg_red);
        this.autoBtn = UIButton
            .create(autoIconTexture, auto_bg, auto_clicked_bg)
            .addTo(this)
            .pos(1846.5, 75)
            
    }

    // onClickShowUIButton() : void {
        
    // }

    // onClickArrowButton() : void {

    // }

    // onClickSkipButton() : void {

    // }

    // onClickOptionButton() : void {

    // }

    // onClickFullScreenButton() : void{

    // }

    // onClickLogButton() : void{

    // }

    onClickAutoButton(callback : Function) : void{
        this.autoBtn.onPressed(callback);
    }

    // onClickTextAction() : void{

    // }    
    
    // async hideHeaderUI(){

    // }

    // async showHeaderUI(){

    // }

    public show(){
        new Tween(this).to({alpha : 1}, 500).start();
    }

    public hide(): void {
        new Tween(this).to({alpha : 0}, 500).start();
    }

}