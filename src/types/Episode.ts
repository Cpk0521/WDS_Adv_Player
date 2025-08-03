// export interface IEpisodeUnit {
//     Id : number
//     EpisodeMasterId : number
//     Order : number
//     GroupOrder : number
//     Effect : string | null
//     SpeakerName : string | null
//     FontSize : FontSizes
//     Phrase : string
//     Title : string | null
//     BackgroundImageFileName : string | null
//     BackgroundCharacterImageFileName : string | null
//     BackgroundImageFileFadeType : FadeTypes | null
//     BgmFileName : string | null
//     SeFileName : string | null
//     StillPhotoFileName : string | null
//     MovieFileName : string | null
//     WindowEffect : WindowEffects | null
//     SceneCameraMasterId : number | null
//     VoiceFileName : string | null
//     CharacterMotions : IEpisodeUnitCharacterMotion[]
//     SpeakerIconId : string | null
//     FadeValue1 : number | null
//     FadeValue2 : number | null
//     FadeValue3 : number | null
// }

// Episode
export interface IEpisodeModel {
    EpisodeId : number
    StoryType : StoryTypes
    Order : number
    Prev : number | undefined | null
    Next : number | undefined | null
    Chapter : string
    Title : string
    EpisodeDetail : IEpisodeUnit[]
}

export type IEpisodeUnit = {
    Id : number
    EpisodeMasterId : number
    Title? : string
} & IEpisodeEffect &
    IEpisodeText &
    IEpisodeBackground &
    IEpisodeFade &
    IEpisodeSound &
    IEpisodeMovie &
    IEpisodeCharacter

export interface IEpisodeEffect {
    Effect? : string
    WindowEffect? : WindowEffects
}

export interface IEpisodeText {
    Order : NextOrderType
    GroupOrder : number
    SpeakerName? : string
    Phrase : string
    FontSize : FontSizes
    SpeakerIconId? : string
    TLSpeakerName? : string // for translation
    TLPhrase? : string // for translation
}

export interface IEpisodeBackground {
    BackgroundImageFileName? : string
    BackgroundCharacterImageFileName? : string
    StillPhotoFileName? : string
    SceneCameraMasterId? : number
}

export interface IEpisodeFade {
    BackgroundImageFileFadeType? : FadeTypes
    FadeValue1? : number
    FadeValue2? : number
    FadeValue3? : number
}

export interface IEpisodeSound {
    BgmFileName? : string
    SeFileName? : string
    VoiceFileName? : string
}

export interface IEpisodeMovie {
    MovieFileName? : string
}

export interface IEpisodeCharacter {
    CharacterMotions : IEpisodeUnitCharacterMotion[]
}

export interface IEpisodeUnitCharacterMotion {
    slotNumber : number
    FacialExpressionMasterId? : number
    HeadMotionMasterId? : number
    HeadDirectionMasterId? : number
    BodyMotionMasterId? : number
    LipSyncMasterId? : number
    SpineId : number
    CharacterAppearanceType : CharacterAppearanceTypes
    CharacterPosition : CharacterPositions
    CharacterLayerType : CharacterLayerTypes
    SpineSize : SpineSizes
}

export enum StoryTypes
{
	Main = 1,
	Event,
	Side,
	Character,
    Special = 6
}

export enum NextOrderType{
    Order = 1,
    GroupOrder
}

export enum FadeTypes
{
	BlackFadeOutFadeIn = 1,
	WhiteFadeOutFadeIn,
	TimeElapsed,
	CrossFade
}

export enum WindowEffects
{
	Sepia = 1,
	WhiteBlur
}

export enum FontSizes
{
	Small = 1,
	Middle,
	Large
}

export enum SpineSizes
{
	Small = 1,
	Middle,
	Large
}

export enum CharacterAppearanceTypes
{
	FadeIn,
	SlideInFromRight,
	SlideInFromLeft,
	SlideInFromBottom
}

export enum CharacterLayerTypes
{
	None,
	Layer1,
	Layer2,
	Layer3
}

export enum CharacterPositions
{
	None,
	OuterLeft,//1920/2 - 495 ???
	InnerLeft,//1920/2 -320
	Center,//1920/2
	InnerRight,//1920/2 +320
	OuterRight//1920/2 + 495 ???
}