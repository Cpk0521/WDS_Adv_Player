// import { NineSlicePlane, Text , Texture, Assets} from 'pixi.js'
import { IViewController, IView } from "../types/View";
import { IEpisodeText } from '../types/Episode';

export class HistoryView extends IView implements IViewController{

    protected _historyRecord : IEpisodeText[] = []

    constructor() {
        super()

        this.visible = false;
    }

    public execute(data : IEpisodeText) {
        // console.log(SpeakerIconId);
        this._historyRecord.push(data);
    }

    clear(){
        this._historyRecord = [];
    }

    

}