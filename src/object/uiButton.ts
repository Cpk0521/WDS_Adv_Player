import { Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js";

export class UIButton extends Sprite {

    protected _content : Sprite;
    protected _base_bg : Texture;
    protected _pressed_bg : Texture;
    protected _isPressed : boolean = false;
    protected _onClickList : Function[] = [];
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
        this.on('click', this._onclick, this);
        this.on('touchstart', this._onclick, this);
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

    addclickFun(callback : (event: FederatedPointerEvent) => void){
        this._onClickList.push(callback);
        return this;
    }

    _onclick(){
        this.Pressed = !this._isPressed;
    }

    get Pressed(){
        return this._isPressed;
    }

    set Pressed(value : boolean){
        this._isPressed = value;

        if(this._isPressed){
            this.texture = this._pressed_bg;
            this._content.tint = 0xffffff;
        }
        else{
            this.texture = this._base_bg;
            this._content.tint = 0x4b4b4b;
        }

        this._onClickList.forEach(callback => callback(this));
    }

}