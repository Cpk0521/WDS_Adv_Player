import { getUrlParams } from "./utils/UrlParams";
import { AdvPlayer } from "./AdvPlayer";
import { createApp } from "./utils/createApp";
import { IRecordController, MediaRecorderController, OBSController } from "./controller/recordController";

const { id, tl, at, sv, rc, obsurl, obspass, renderer } = getUrlParams();

const app = await createApp(<'webgl' | 'webgpu'> renderer);
// const iFrameDetection = (window === window.parent);

//create Adv Player
const advplayer = await AdvPlayer.create(app.stage);
(globalThis as any).advplayer = advplayer;

// advplayer.loadAndPlay('2006008');
// advplayer.loadAndPlay('1010110', 'zhcn');

let _id = id ?? prompt("Please enter the story Id", "1000000");

if (sv && sv.toLowerCase() === 'true') {
  let recordController: IRecordController | undefined;

  switch (rc?.toLowerCase()) {
    case 'obs':
      if (obsurl) {
        recordController = await OBSController.create(obsurl, obspass);
      }
      break;
    case 'mediarecorder':
    case 'mr':
    case '':
    case undefined:
    default:
      // default
      recordController = MediaRecorderController.create(
        app.canvas.captureStream(24),
        // await navigator.mediaDevices.getDisplayMedia({ audio: true })
      );
      break;
  }

  if (recordController) {
    if (typeof recordController.setFileName === "function") {
      recordController.setFileName(`wds_adv_record_${_id}${tl ? `_${tl}` : ''}_${new Date().valueOf()}.mkv`);
    }
    advplayer.setRecorder(recordController);
  }
}

_id && advplayer.loadAndPlay(_id, tl, at, sv);
