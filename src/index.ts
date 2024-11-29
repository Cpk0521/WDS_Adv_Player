import { getUrlParams } from "./utils/UrlParams";
import { AdvPlayer } from "./AdvPlayer";
import { createApp } from "./utils/createApp";

const { id, tl, at } = getUrlParams();

const app = createApp();

const advplayer = AdvPlayer.create();
advplayer.addTo(app.stage);

// advplayer.loadAndPlay('2001402');
// advplayer.loadAndPlay('110081');
// advplayer.loadAndPlay('1010101');
// advplayer.loadAndPlay('2004401'); 
// advplayer.loadAndPlay('1010110', 'zhcn');
// 1010119

if (id) {
  advplayer.loadAndPlay(id, tl, at);
} else {
  let _id = prompt("Please enter the story Id", "1000000");
  _id && advplayer.loadAndPlay(_id, tl, at);
}

