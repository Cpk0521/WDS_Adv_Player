import * as PIXI from "pixi.js";
import { getUrlParams } from './utils/UrlParams'
import { AdvPlayer } from "./AdvPlayer";
// import '@pixi-spine/loader-uni'
// import { Spine } from 'pixi-spine';
import { Tween, Group } from "tweedle.js";


function createApp() {
    if (document.getElementById("WDS")) {
        document.getElementById("WDS")!.remove();
    }

    const pixiapp = new PIXI.Application<HTMLCanvasElement>({
        hello : false,
        width: 1920,
        height: 1080,
    });

    (globalThis as any).__PIXI_APP__ = pixiapp;

    pixiapp.view.setAttribute("id", "WDS");
    document.body.appendChild(pixiapp.view);

    PIXI.Ticker.shared.add(() => Group.shared.update());

    let resize = () => {
        let width = document.documentElement.clientWidth;
        let height = document.documentElement.clientHeight;
    
        let ratio = Math.min(width / 1920, height / 1080);

        let resizedX = 1920 * ratio;
        let resizedY = 1080 * ratio;

        pixiapp.view.style.width = resizedX + 'px';
        pixiapp.view.style.height = resizedY + 'px';
    }

    window.onresize = () => resize();
    resize();

    return pixiapp
}

const { id } = getUrlParams('id');

const app = createApp();

// for Test
// const container = new PIXI.Container();
// app.stage.addChild(container)

// const check_texture = await PIXI.Assets.load('https://raw.githubusercontent.com/nan0521/WDS-Adv-Resource/main/background/700.png');
// const check = new PIXI.Sprite(check_texture)
// container.addChild(check)
// check.x = app.screen.width / 2
// check.y = app.screen.height / 2
// check.anchor.set(0.5)

// const spinedata = await PIXI.Assets.load('./jugon_progress/jugon_progress.skel');
// const spine = new Spine(spinedata.spineData)
// app.stage.addChild(spine);
// spine.scale.set(.25);
// const s_h = spine.getBounds().height / 2
// spine.position.set(app.screen.width / 2, app.screen.height / 2 - (-s_h));
// const aplha_f = new PIXI.AlphaFilter();
// spine.filters = [aplha_f];
// spine.state.setAnimation(0, "animation", false);

// let obj = new PIXI.Graphics();
// obj.beginFill(0xFFFF50);
// obj.drawRect(0, 0, app.screen.width, app.screen.height);
// obj.alpha = 0.5
// app.stage.addChild(obj)
// obj.blendMode = PIXI.BLEND_MODES.MULTIPLY;


const advplayer = AdvPlayer.create();
advplayer.addTo(app.stage);

// advplayer.loadAndPlay('1000000');
advplayer.loadAndPlay('1010101');
// advplayer.loadAndPlay('2000101');
// if(id){
//     advplayer.loadAndPlay(id);
// }



