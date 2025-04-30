// export const advConstant = {
//     SmallFontSize: 32,
//     MiddleFontSize: 40,
//     LargeFontSize: 68,
//     TextDisplaySpeed: 400,
//     TextSpeed: 10,
//     CameraMoveDivisionValue: 1000,
//     RoundDigits: 2,
//     SpineIdDivisionValue: 100,
//     ProcessingWaitTime: 2,
//     DefaultValue: 1,
//     AlphaDuration: 0.2,
//     ZeroAlphaDuration: 0,
//     BackgroundAlphaDuration: 0.001,
//     SidePositionValue: 3.2,
//     CenterPositionValue: 0,
//     CharacterDefaultPositionY: -5.5,
//     LowStatureCharacterPositionY: -4.8,
//     SliderDivisionValue: 100.0,
// };

// export const playerSize = {
//     Width: 1920,
//     Height: 1080,
// };

export enum Layer {
    BackgroundLayer = 1,
    CharacterLayer,
    EffectLayer,
    TextLayer,
    MovieLayer,
    FadeLayer,
    UILayer = 10,
    HistroyLayer,
    CoverLayer = 12,
}

export const baseAssets = {
    font: "./RoNOWStd-GBs.otf",
    icon_bg_red: "./btn_story_scene_icon_bg_red.png",
    icon_bg_common: "./btn_common_square.png",
    log_voice_bg: "./btn_story_scene_log_voice_bg.png",
    icon_auto: "./btn_story_scene_icon_auto.png",
    // icon_full_screen : './btn_story_scene_icon_full_screen.png', // 未用到就不laod
    // icon_log : './btn_story_scene_icon_log.png',
    // icon_option : './btn_story_scene_icon_option.png',
    // icon_skip : './btn_story_scene_icon_skip.png',
    // icon_voice : './btn_story_scene_icon_voice.png',
    icon_translate: "./btn_story_scene_icon_translate.png",
    icon_next: "./btn_story_scene_icon_next.png",
    slide: "./btn_story_scene_slide.png",
    name_bg: "./frm_story_scene_name_bg.png",
    serif_window_bg: "./frm_story_scene_serif_window_bg.png",
    bg_pattern: "./ptn_common_05.png",
    tap_to_start: "./txt_title_common_start.png",
    illust_jugon_1: "./img_story_scene_illust_jugon_1.png",
    illust_jugon_2: "./img_story_scene_illust_jugon_2.png",
    illust_jugon_3: "./img_story_scene_illust_jugon_3.png",
    jugon_progress: "./jugon_progress/jugon_progress.skel",
    jugon_progress_atlas: "./jugon_progress/jugon_progress.atlas",
    sepia : "./sepia2.png",
    whiteBlur : "./whiteBlurEffect.png",    
};

export const baseAssetsUrl = "https://raw.githubusercontent.com/wds-sirius/Adv-Resource/main";
