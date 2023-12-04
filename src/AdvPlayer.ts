// import { Container } from "@pixi/display";
// import { FederatedPointerEvent } from '@pixi/events';
// import { Assets } from "@pixi/assets";
import { Container, FederatedPointerEvent, Assets , Ticker, Sprite, Texture} from 'pixi.js';
import '@pixi-spine/loader-uni'
import '@pixi/sound';
import { Group, Tween } from 'tweedle.js';
//type
import { IEpisodeModel, IEpisodeTranslate } from "./types/Episode";
//views
import { BackgroundView } from './views/BackgroundView';
import { CharacterView } from './views/CharacterView';
import { EffectView } from './views/EffectView';
import { MovieView } from './views/MovieView';
import { TextView } from './views/TextView';
import { HistoryView } from './views/HistoryView';
//object
import { UIView } from './views/UIView';
import { CoverOpening } from './object/CoverOpening';
//manager
import { SoundManager } from "./controller/SoundManager";
import { TranslationManager } from './controller/TranslationManager';
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
	protected _historyView : HistoryView | undefined;
	protected _uiView : UIView;
	protected _coverView : CoverOpening;
	//Manager
	protected _soundManager : SoundManager = new SoundManager();
	protected _translationManager : TranslationManager = new TranslationManager();
	//player Info
	protected _episode! : IEpisodeModel | undefined;
	protected _currentIndex : number = 0;
	protected _isAuto : boolean = false;
	protected _isVoice : boolean = true;
	protected _isAdventureEnded : boolean = false;
	protected _processing : Promise<any>[] = [];
	protected _trackPromise : Promise<boolean> | undefined;
    
    constructor(){
        super();
		
		//spine pma setting
		Assets.setPreferences({
			preferCreateImageBitmap: false
		});

		//register the tweedle timer to pixi ticker
		// Ticker.shared.add(() => Group.shared.update());

		//player setting
		this.addChild(createEmptySprite({color : 0x00DD00}));
		this.sortableChildren = true;
		this.eventMode = 'static';
		globalThis.addEventListener('blur', this._onBlur.bind(this));

		//object
		this._coverView = CoverOpening.new().addTo(this, Layer.CoverLayer);
		this._uiView = new UIView().addTo(this, Layer.UILayer);
    }

    public static create(){
        return new this();
    }

    public addTo<C extends Container>(parent : C) : AdvPlayer{
		parent.addChild(this);
		return this;
    }

	protected async _init(){
		
		this._backgroundView = new BackgroundView().addTo(this, Layer.BackgroundLayer);
		this._characterView = new CharacterView().addTo(this, Layer.CharacterLayer);
		this._effectView = new EffectView().addTo(this, Layer.EffectLayer);
		this._textView = TextView.new().addTo(this, Layer.TextLayer);
		this._movieView = new MovieView().addTo(this, Layer.MovieLayer);
		this._historyView = new HistoryView().addTo(this, Layer.HistroyLayer);

		await Assets.load(baseAssets.font);

		return this._isinited = true;
	}
	
	public async clear(){
		await Assets.unloadBundle(`${this._episode!.EpisodeId}_bundle`);
		this._currentIndex = 0;
		this._episode = undefined;
	}

	public async load(source : string | IEpisodeModel, translate? : IEpisodeTranslate[]) {
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

			if(translate){
				this._translationManager.load(translate);
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

	public loadAndPlay(source : string | IEpisodeModel, translate? : IEpisodeTranslate[]){
		this.load(source, translate).then(() => this._onready())
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
		this._soundManager.isVoice = this._isVoice;
		if(this._isVoice){
			let voicemanifest = await loadJson<string[]>(resPath.manifest(episodeTrack.EpisodeId));
			voicemanifest.forEach((VoiceFileName)=>{
				resources[`voice_${VoiceFileName}`] = resPath.voice(episodeTrack.EpisodeId, VoiceFileName);
			})
		}
		
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
		//cover
		this._coverView?.start();
		this._coverView?.once('click', this._play, this)
	}

	protected _play(){
		this._coverView?.hide();
		//ui view
		this._uiView!.alpha = 1;
		this._uiView?.AutoBtn.addclickFun(()=>{
			this._isAuto = this._uiView!.AutoBtn.Pressed;
			if(this._isAuto && this._trackPromise){
				this._trackPromise.then((bool) => {
					//不要在等待過程中
					if(bool){
						this._renderFrame();
					}
				})
			}
		})
		//click
		this.on('click', this._tap, this);
		this._renderFrame();
	}

	protected _next(){
		this._currentIndex ++;
		return this.currentTrack;
	}

	protected async _renderFrame(){
		// 儲存目前的index
		let index = this._currentIndex;
		// 
		this._trackPromise = undefined;
		// 如果完結了或找不到當前的Track
		if(!this.currentTrack){
			return
		}
		
		console.log(this.currentTrack);

		if(this._translationManager.isTranslate){
			let tl = this._translationManager.getTranslate(this.currentTrack.Id)
			if(tl){
				this.currentTrack.Phrase = tl.Phrase;
				this.currentTrack.SpeakerName = tl.SpeakerName;
			}
		}
		
		// 隱藏上輪的
		this._characterView?.hideAllCharacter();
		this._soundManager.stopPrevSound();
		this._textView?.hideTextPanel();
		this._effectView?.hideEffect(this.currentTrack);

		this._historyView?.execute(this.currentTrack);

		let bg_process = this._backgroundView?.execute(this.currentTrack);
		let phrase = this.currentTrack.Phrase
		if(bg_process){
			this._processing.push(bg_process);
			await bg_process;
		}

		let movie_process = this._movieView?.execute(this.currentTrack)
		if(movie_process){
			this._processing.push(movie_process);
			await movie_process;
		}

		this._effectView?.execute(this.currentTrack);
		this._characterView?.execute(this.currentTrack);
		this._textView?.execute(this.currentTrack);

		this._soundManager.execute(this.currentTrack);
		this._soundManager.onVoiceEnd.push(() => this._characterView?.offAllLipSync());
		
		//
		this._next();

		// Animations
		if(this._processing.length > 0){
			await Promise.all(this._processing).then(()=>{
				this._processing = [];
			})
		}

		// 計算等候時間
		let voice_duration = this._soundManager.voiceDuration;
		let text_duration = this._textView?.typingTotalDuration ?? 0;
		let duration = Math.max(voice_duration, text_duration);

		//處理沒有文字 自動跳下一個
		if(phrase.length === 0){

			let timeout : any = setTimeout(()=>{
				clearTimeout(timeout);
				timeout = undefined;
				//確保按下了一次後不會繼續
				if(index + 1 === this._currentIndex){
					this._renderFrame();
				}
			}, duration);

			return;
		}

		if(this._isAuto){
			// 計算auto等候時間
			duration += (advConstant.ProcessingWaitTime * 1000) + 800;
	
			return this._trackPromise = Promise.resolve(index).then((index)=>{
				return new Promise((res, _)=>{
					let timeout : any = setTimeout(()=>{
						clearTimeout(timeout);
						timeout = null;
						// 確保等候完是auto狀態
						if(this._isAuto && index + 1 === this._currentIndex) { 
							this._trackPromise = undefined;
							this._renderFrame();
							res(false);
						}
						res(true);
					}, duration);
				})
			})
		}

		// 如果不是auto 就return
		return this._trackPromise = new Promise((res, _)=>{
			let timeout : any = setTimeout(()=>{
				clearTimeout(timeout);
				timeout = null;
				res(true);
			}, duration + 1000);
		});
	}

	protected _onBlur(){
		if(this._isAuto){
			this._isAuto = false;
			this._uiView!.AutoBtn.Pressed = false;
		}
	}

	protected _tap(e : FederatedPointerEvent){
		if(e.target !== this) {return;}
		if(this._processing.length === 0 && !this._isAuto){
			this._renderFrame();
		}
		if(this._isAuto){
			this._uiView?.ShortShow();
		}
	}

	get Track(){
		return this._episode?.EpisodeDetail;
	}

	get currentTrack(){
		return this._episode?.EpisodeDetail[this._currentIndex];
	}

	get nextTrack() {
		return (this._currentIndex + 1 >= (this._episode?.EpisodeDetail.length ?? 0))
			? undefined
			: this._episode?.EpisodeDetail[this._currentIndex + 1]
    }

}
