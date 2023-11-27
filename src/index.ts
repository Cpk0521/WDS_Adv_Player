import * as PIXI from "pixi.js";
import '@pixi-spine/loader-uni'
// import { Spine } from '@pixi-spine/runtime-4.1'
// import { getUrlParams } from './utils/UrlParams'
import { AdvPlayer } from "./AdvPlayer"
// import { FontSizes } from "./types/Episode";

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

// const { id } = getUrlParams('id');

const app = createApp();

const check_texture = await PIXI.Assets.load('./UI.png');
const check = new PIXI.Sprite(check_texture)
app.stage.addChild(check)
check.x = app.screen.width / 2
check.y = app.screen.height / 2
check.anchor.set(0.5)

const advplayer = AdvPlayer.new();
advplayer.addTo(app.stage);

// if(id){
//     advplayer.loadAndPlayEpisode(`https://raw.githubusercontent.com/WDS-Sirius/WDS_Adv_Resources/main/episode/${id}.json`);
//     // advplayer.playEpisode()
// }

advplayer.loadAndPlay('2000101');


// PIXI.Assets.setPreferences({
//     preferCreateImageBitmap: false,
//     // preferWorkers: false
// });

// const scale = app.screen.width / 800 * 0.35;


// const bg_texture = await PIXI.Assets.load('https://raw.githubusercontent.com/WDS-Sirius/WDS_Adv_Resources/main/background/250.png');
// const bg = new PIXI.Sprite(bg_texture)
// app.stage.addChild(bg)
// bg.x = app.screen.width / 2
// bg.y = app.screen.height / 2
// bg.anchor.set(0.5)
// bg.scale.set(1.16)

// const spine_02_data = await PIXI.Assets.load('https://raw.githubusercontent.com/WDS-Sirius/WDS_Adv_Resources/main/spine/30102.skel');
// const spine_02 = new Spine(spine_02_data.spineData)
// app.stage.addChild(spine_02)
// spine_02.x = app.screen.width * 0.5;
// spine_02.y = app.screen.height;
// spine_02.scale.set(.75)
// spine_02.state.setAnimation(0, "breath", true);
// spine_02.state.setAnimation(1, "body/unique6", false);

// const spine_03_data = await PIXI.Assets.load('https://raw.githubusercontent.com/WDS-Sirius/WDS_Adv_Resources/main/spine/10101.skel');
// const spine_03 = new Spine(spine_03_data.spineData)
// app.stage.addChild(spine_03)
// // console.log(spine_03.getBounds())
// spine_03.x = app.screen.width * 0.5;
// spine_03.y = app.screen.height;
// spine_03.scale.set(.8)
// spine_03.state.setAnimation(0, "breath", true);
// spine_03.state.setAnimation(1, "body/unique6", false);

