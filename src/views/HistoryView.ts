// import { NineSlicePlane, Text , Texture, Assets} from 'pixi.js'
import { IView } from "../types/View";
import { IEpisodeText } from '../types/Episode';

export class HistoryView extends IView {

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