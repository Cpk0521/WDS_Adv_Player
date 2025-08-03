import { getUrlParams } from "./utils/UrlParams";
import { AdvPlayer } from "./AdvPlayer";
import { createApp } from "./utils/createApp";

const { id, tl, at, renderer } = getUrlParams();

const app = await createApp(<'webgl' | 'webgpu'> renderer);
// const iFrameDetection = (window === window.parent);

//create Adv Player
const advplayer = await AdvPlayer.create(app.stage);
(globalThis as any).advplayer = advplayer;

// advplayer.loadAndPlay('2006008');
// advplayer.loadAndPlay('1010110', 'zhcn');

if (id) {
  advplayer.loadAndPlay(id, tl, at);
} else {
  let _id = prompt("Please enter the story Id", "1000000");
  _id && advplayer.loadAndPlay(_id, tl, at);
}
