import { Texture } from "pixi.js";
import { IView } from "../types/View";
import { baseAssets } from '../constant/advConstant'
import { Tween } from "tweedle.js";
import { UIButton } from "../utils/uiButton";

export class UIView extends IView {

    protected _isHidden : boolean = false;
    protected _autoBtn : UIButton;

    constructor(){
        super();

        this.alpha = 0;

        //auto Button
        let autoIconTexture = Texture.from(baseAssets.icon_auto);
        let auto_bg = Texture.from(baseAssets.icon_bg_common);
        let auto_clicked_bg = Texture.from(baseAssets.icon_bg_red);
        this._autoBtn = UIButton
            .create(autoIconTexture, auto_bg, auto_clicked_bg)
            .addTo(this)
            .pos(1846.5, 75)
            // .addclickFun(()=>{
            //     this._isHidden = !this._isHidden;
            // })
    }

    public show(){
        return new Tween(this).to({alpha : 1}, 500).start();
    }

    public hide() {
        return new Tween(this).to({alpha : 0}, 500).start();
    }

    get AutoBtn() {
        return this._autoBtn;
    }

}