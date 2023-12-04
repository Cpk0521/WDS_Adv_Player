import { NineSlicePlane, Text , Texture, Assets} from 'pixi.js'
import { IViewController, IView } from "../types/View";
import { baseAssets } from '../constant/advConstant';
import { IEpisodeText } from '../types/Episode';

export class HistoryView extends IView implements IViewController{

    protected _historyRecord : IEpisodeText[] = []

    constructor() {
        super()

        this.visible = false;
    }

    public execute({ SpeakerName, Phrase, FontSize, SpeakerIconId } : IEpisodeText) {
        // console.log(SpeakerIconId);
        this._historyRecord.push({ SpeakerName, Phrase, FontSize, SpeakerIconId })
    }

    clear(){
        this._historyRecord = [];
    }

    

}