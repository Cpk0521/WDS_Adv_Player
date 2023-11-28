// import { Container } from "@pixi/display";
// import { FederatedPointerEvent } from '@pixi/events';
// import { Assets } from "@pixi/assets";
import { Container, FederatedPointerEvent, Assets , Ticker, Sprite, Texture} from 'pixi.js';
import '@pixi-spine/loader-uni'
import { Group, Tween } from 'tweedle.js';
//type
import { IEpisodeModel } from "./types/Episode";
//views
import { BackgroundView } from './views/BackgroundView';
import { CharacterView } from './views/CharacterView';
import { EffectView } from './views/EffectView';
import { MovieView } from './views/MovieView';
import { TextView } from './views/TextView';
import { FadeView } from './views/FadeView';
import { UIView } from './views/UIView';
import { HistoryView } from './views/HistoryView';
//manager
import '@pixi/sound';
import { SoundManager } from "./controller/SoundManager";
//constant
import { advConstant, baseAssets, Layer } from './constant/advConstant';
//utils
import { checkImplements, isURL } from "./utils/check";
import createEmptySprite from "./utils/emptySprite";
import loadJson from "./utils/loadJson";
import resPath from "./utils/resPath";

export class AdvPlayer extends Container {

	//init
	protected _isinited : boolean = false;
	protected _loadPromise : Promise<any> | undefined;
	//View
	protected _backgroundView : BackgroundView | undefined;
	protected _characterView : CharacterView | undefined;
	protected _effectView : EffectView | undefined;
	protected _textView : TextView | undefined;
	protected _movieView : MovieView | undefined;
	protected _fadeView : FadeView | undefined;
	protected _uiView : UIView | undefined;
	protected _historyView : HistoryView | undefined;
	//Manager
	protected _soundManager : SoundManager = new SoundManager();
	//player Info
	protected _episode! : IEpisodeModel | undefined;
	protected _currentIndex : number = 0;
	protected _isAuto : boolean = false;
	protected _isAdventureEnded : boolean = false;
	protected _processing : Promise<any>[] = [];
	// remove later
	private _touchText : Sprite
    
    constructor(){
        super();
		
		//spine pma setting
		Assets.setPreferences({
			preferCreateImageBitmap: false
		});
		//register the tweedle timer to pixi ticker
		Ticker.shared.add(() => Group.shared.update());

		//player
		this.addChild(createEmptySprite({color : 0x000000}));
		this.sortableChildren = true;
		this.eventMode = 'static';
		this.addEventListener('blur', this._onBlur.bind(this));
		
		//remove later
		this._touchText = new Sprite(Texture.from(baseAssets.tap_to_start));
		this._touchText.anchor.set(0.5);
		this._touchText.position.set(1920/2, 1080/2);
    }

    public static create(){
        return new this();
    }

    public addTo<C extends Container>(parent : C) : AdvPlayer{
		parent.addChild(this);
		return this;
    }

	protected async _init(){
		// Assets.addBundle('Common', baseAssets);
		// await Assets.loadBundle('Common');

		this._backgroundView = new BackgroundView().addTo(this, Layer.BackgroundLayer);
		this._characterView = new CharacterView().addTo(this, Layer.CharacterLayer);
		// this._effectView = new EffectView().addTo(this, Layer.EffectLayer);
		this._textView = TextView.new().addTo(this, Layer.TextLayer);
		this._movieView = new MovieView().addTo(this, Layer.MovieLayer);
		// this._fadeView = new FadeView().addTo(this, Layer.FadeLayer);
		this._uiView = new UIView().addTo(this, Layer.UILayer);
		this._historyView = new HistoryView().addTo(this, Layer.HistroyLayer);

		await Assets.load(baseAssets.font);

		return this._isinited = true;
	}
	
	public async clear(){
		await Assets.unloadBundle(`${this._episode!.EpisodeId}_bundle`);
		this._currentIndex = 0;
		this._episode = undefined;
	}

	public async load(source : string | IEpisodeModel) {
		return this._loadPromise = new Promise<IEpisodeModel>(async (res, _) => {
			if(typeof source === 'string') {
				if(!isURL(source)){
					source = resPath.advJson(source);
				}
				source = await loadJson<IEpisodeModel>(source)
					.catch(()=>{
						throw new Error('The episode ID is wrong, please reconfirm.');
					});
			}

			if(!checkImplements<IEpisodeModel>(source)){
				throw new Error('Episode file format error');
			}

			if(!this._isinited){
				await this._init();
			}

			if(this._episode){
				await this.clear()
			}

			this._episode = source as IEpisodeModel;
			await this._loadResourcesFromEpisode(source);

			res(this._episode);
		})
	}

	public loadAndPlay(source : string | IEpisodeModel){
		this.load(source).then(() => this._onready())
	}

	protected async _loadResourcesFromEpisode(episodeTrack : IEpisodeModel){
		const resources = {} as Record<string, string>;

		episodeTrack.EpisodeDetail.forEach((unit)=>{
			//Backgorund
			if (unit.BackgroundImageFileName){
				if(!resources[`bg_${unit.BackgroundImageFileName}`]){
					resources[`bg_${unit.BackgroundImageFileName}`] = resPath.background(unit.BackgroundImageFileName);
				}
			}

			//CharacterImages
			if(unit.BackgroundCharacterImageFileName){
				if(!resources[`card_${unit.BackgroundCharacterImageFileName}`]){
					resources[`card_${unit.BackgroundCharacterImageFileName}`] = resPath.cards(unit.BackgroundCharacterImageFileName);
				}
			}

			//still
			if(unit.StillPhotoFileName){
				if(!resources[`still_${unit.StillPhotoFileName}`]){
					resources[`still_${unit.StillPhotoFileName}`] = resPath.still(unit.StillPhotoFileName);
				}
			}

			//movie
			if(unit.MovieFileName){
				if(!resources[`movie_${unit.MovieFileName}`]){
					resources[`movie_${unit.MovieFileName}`] = resPath.movie(unit.MovieFileName);				
				}
			}

			//bgm
			if(unit.BgmFileName){
				if(unit.BgmFileName != '999' && !resources[`bgm_${unit.BgmFileName}`]){
					resources[`bgm_${unit.BgmFileName}`] = resPath.bgm(unit.BgmFileName);
				}
			}

			//Se
			if(unit.SeFileName){
				if(!resources[`se_${unit.SeFileName}`]){
					resources[`se_${unit.SeFileName}`] = resPath.se(unit.SeFileName);
				}
			}

			//spine
			unit.CharacterMotions.forEach((motion)=>{
				if(motion.SpineId != 0 && !resources[`spine_${motion.SpineId}`]){
					resources[`spine_${motion.SpineId}`] = resPath.spine(motion.SpineId);
				}
			})
		})

		//voice
		let voicemanifest = await loadJson<string[]>(resPath.manifest(episodeTrack.EpisodeId));
		voicemanifest.forEach((VoiceFileName)=>{
			resources[`voice_${VoiceFileName}`] = resPath.voice(episodeTrack.EpisodeId, VoiceFileName);
		})
		
		Assets.addBundle(`${this._episode!.EpisodeId}_bundle`, resources)
		return Assets.loadBundle(`${this._episode!.EpisodeId}_bundle`);

	}

	public play(){
		if(this._loadPromise){
			this._loadPromise.then(() => this._onready())
		}
	}

	protected _onready(){
		if(!this._loadPromise){
			console.log('dont repeat play');
			return
		}
		this._loadPromise = undefined;
		//click
		this.cursor = 'pointer';
		this.addChild(this._touchText);
		this.once('click', this._play, this);
	}

	protected _play(){
		this.cursor = 'default';
		this.removeChild(this._touchText);
		this.on('pointerdown', this._tap, this);
		this._renderFrame();
	}

	protected _next(){
		this._currentIndex ++;
		return this.currentTrack;
	}

	protected _renderFrame(){
		if(!this.currentTrack){
			return
		}

		console.log(this.currentTrack)
		
		// const { 
		// 	Order, GroupOrder, Effect, SpeakerName,
		// 	FontSize, Phrase, Title, BackgroundImageFileName, BackgroundCharacterImageFileName,
		// 	BackgroundImageFileFadeType, BgmFileName, SeFileName, StillPhotoFileName,
		// 	MovieFileName, WindowEffect, SceneCameraMasterId, VoiceFileName, CharacterMotions,
		// 	SpeakerIconId, FadeValue1, FadeValue2, FadeValue3,
		// } = this.currentTrack

		this._soundManager.execute(this.currentTrack);
		this._soundManager.onVoiceEnd.push(() => this._characterView?.offAllLipSync());
		
		let bg_process = this._backgroundView?.execute(this.currentTrack);
		if(bg_process){
			this._processing.push(bg_process);
		}

		this._characterView?.execute(this.currentTrack);
		this._textView?.execute(this.currentTrack);
		this._movieView?.execute(this.currentTrack)
		this._historyView?.execute(this.currentTrack);
		
		// this._effectView.process(WindowEffect)
		// this._fadeView.process(BackgroundImageFileFadeType, FadeValue1, FadeValue2, FadeValue3)
		
		// let duration = this._soundManager.voiceDuration;


		this._next();

		// if(this._isAuto){

		// 	if(VoiceFileName){
		// 		let duration = this._soundManager.voiceDuration;
	
		// 		let timeout : any = setTimeout(()=>{
		// 			clearTimeout(timeout);
		// 			timeout = null;
		// 			this._renderFrame();
		// 		}, duration + 2000)
		// 	}

		// }

		if(this._processing.length > 0){
			Promise.all(this._processing).then(()=>{
				this._renderFrame();
				this._processing = [];
			})
		}
	}

	protected _onBlur(){
		if(this._isAuto){
			this._isAuto = false
		}
	}

	protected _tap(e : FederatedPointerEvent){
		if(e.target !== this) {return;}
		if(this._processing.length === 0 && !this._isAuto){
			this._renderFrame();
		}
	}

	get Track(){
		return this._episode?.EpisodeDetail;
	}

	get currentTrack(){
		return this._episode?.EpisodeDetail[this._currentIndex];
	}

	get nextTrack() {
        return this._episode?.EpisodeDetail[this._currentIndex + 1];
    }

}