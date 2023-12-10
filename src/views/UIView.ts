import { Texture } from "pixi.js";
import { Tween } from "tweedle.js";
import { IView } from "../types/View";
import { baseAssets } from '../constant/advConstant'
import { UIButton } from "../object/uiButton";

enum UIViewStatus {
    Hide,
    Show,
}

export class UIView extends IView {

    protected _currentStatus : UIViewStatus = UIViewStatus.Show;
    protected _autoBtn : UIButton;
    protected _Animation : Tween<this> | undefined

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
            .addclickFun(()=>{
                let isauto = this._autoBtn.Pressed
                this._Animation?.stop();
                this._Animation?.stopChainedTweens();
                if(!isauto){
                    this._Animation = this._showAnimation().start();
                    this._currentStatus = UIViewStatus.Show;
                }
                else{
                    this._Animation = this._hideAnimation().delay(1000).start();
                    this._currentStatus = UIViewStatus.Hide;
                }
            })
    }
    
    // hidden -> show -> hidden
    // show -> nothing -> hidden
    // show -> BtnClicked(Off) -> show
    // BtnClicked(On) -> hidden
    public ShortShow(){
        if(this._currentStatus === UIViewStatus.Hide && this.alpha === 0){
            this._Animation = this._showAnimation();
            this._Animation.chain(this._hideAnimation().delay(3000));
            this._Animation.start();
        }
    }

    public _showAnimation(){
        return new Tween(this).to({alpha : 1}, 500)
    }

    public _hideAnimation() {
        return new Tween(this).to({alpha : 0}, 500)
    }

    get AutoBtn() {
        return this._autoBtn;
    }

}