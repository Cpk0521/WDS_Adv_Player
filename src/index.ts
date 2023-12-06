import * as PIXI from "pixi.js";
import { getUrlParams } from './utils/UrlParams'
import { AdvPlayer } from "./AdvPlayer";
import { Group } from "tweedle.js";

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
const check_texture = await PIXI.Assets.load('./spine2.png');
const check = new PIXI.Sprite(check_texture)
app.stage.addChild(check)
check.x = app.screen.width / 2
check.y = app.screen.height / 2
check.anchor.set(0.5)

const advplayer = AdvPlayer.create();
advplayer.addTo(app.stage);

// advplayer.loadAndPlay('1000000');
// advplayer.loadAndPlay('1010101');
advplayer.loadAndPlay('110042');
// advplayer.loadAndPlay('110011');

// if(id){
//     advplayer.loadAndPlay(id);
// }
// else{
//     let _id = prompt("Please enter the story Id", '1000000');
//     _id && advplayer.loadAndPlay(_id);
// }
