import { getUrlParams } from "./utils/UrlParams";
import { AdvPlayer } from "./AdvPlayer";
import { createApp } from "./utils/createApp";

const { id, tl, at } = getUrlParams();

const app = await createApp();

const advplayer = AdvPlayer.create(); //create Adv Player
await advplayer.init(); // init Adv Player
advplayer.addTo(app.stage);

// advplayer.loadAndPlay('1000000');
// advplayer.loadAndPlay('110081');
// advplayer.loadAndPlay('2001206');
// advplayer.loadAndPlay('110081'); 
// advplayer.loadAndPlay('1010110', 'zhcn');
// 1010119

if (id) {
  advplayer.loadAndPlay(id, tl, at);
} else {
  let _id = prompt("Please enter the story Id", "1000000");
  _id && advplayer.loadAndPlay(_id, tl, at);
}