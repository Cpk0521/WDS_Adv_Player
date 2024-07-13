import * as PIXI from "pixi.js";
import { getUrlParams } from "./utils/UrlParams";
import { AdvPlayer } from "./AdvPlayer";
import { Group } from "tweedle.js";

function createApp() {
  if (document.getElementById("WDS")) {
    document.getElementById("WDS")!.remove();
  }

  const pixiapp = new PIXI.Application<HTMLCanvasElement>({
    hello: false,
    width: 1920,
    height: 1080,
  });

  (globalThis as any).__PIXI_APP__ = pixiapp;

  pixiapp.view.setAttribute("id", "WDS");
  document.body.appendChild(pixiapp.view);

  PIXI.Ticker.shared.add(() => Group.shared.update());

  let resize = () => {
    const screenWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    const screenHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );

    const ratio = Math.min(screenWidth / 1920, screenHeight / 1080);

    let resizedX = Math.floor(1920 * ratio);
    let resizedY = Math.floor(1080 * ratio);

    pixiapp.view.style.width = resizedX + "px";
    pixiapp.view.style.height = resizedY + "px";
  };

  window.onresize = () => resize();
  resize();

  return pixiapp;
}

const { id } = getUrlParams("id");

const app = createApp();

const advplayer = AdvPlayer.create();
advplayer.addTo(app.stage);

// for testing
// const spine_test = PIXI.Sprite.from('./110022_3.png');
// spine_test.alpha = .4
// app.stage.addChild(spine_test);

advplayer.loadAndPlay('2001402');
// advplayer.loadAndPlay('110081');
// advplayer.loadAndPlay('1010101');
// advplayer.loadAndPlay('2003503');
// advplayer.loadAndPlay('1000000');
// 1010119

// if (id) {
//   advplayer.loadAndPlay(id);
// } else {
//   let _id = prompt("Please enter the story Id", "1000000");
//   _id && advplayer.loadAndPlay(_id);
// }