<div align="center">
  <img src="assets/cover.png" alt="WDS">
  <hr>
</div>

<div align="center">
  
  <img src="https://img.shields.io/badge/typescript-%233178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/pixijs%208.6.3%20-%23e22162.svg?style=for-the-badge">
  <img src="https://img.shields.io/badge/spine%204.1-%23CC6699?style=for-the-badge&logoColor=white">
</div>

## About
A self-made adventure Player to render the stories for game [ワールドダイスター 夢のステラリウム](https://world-dai-star.com/game).

## Demo
[Online Demo](https://cpk0521.github.io/WDS_Adv_Player/?id=1000000)

## URL Parameters

| Parameters  | description | value |
| :-------------: | :-------------: | :-------------:|
|id  | Story Id | |
|tl  | Translate language | [#](https://github.com/Cpk0521/WDS_Adv_Player?tab=readme-ov-file#translation) |
|at  | Lock in Auto play Mode | true |
|sv  | Save video record | true |
|rc  | (When sv=true) Record Controller Type | (Default)`mediarecorder`, `mr`, `obs` |
|obsurl  | (When rc=obs, Required) OBS WebSocket URL | `ws://[ip]:[port]` |
|obspass  | (When rc=obs, Optional) OBS WebSocket Password | `[password]` |
|renderer  | Renderer Type | `webgl`, `webgpu` |

Example : 
 - `https://cpk0521.github.io/WDS_Adv_Player/?id=1000000`
 - `https://cpk0521.github.io/WDS_Adv_Player/?id=2006008&tl=zhai`
 - `https://cpk0521.github.io/WDS_Adv_Player/?renderer=webgl`
 - `https://cpk0521.github.io/WDS_Adv_Player/?at=true`
 - `https://cpk0521.github.io/WDS_Adv_Player/?at=true&sv=true`
 - `https://cpk0521.github.io/WDS_Adv_Player/?at=true&sv=true&rc=obs&obsurl=ws://localhost:4455`

## Translation

Currently supported languages :
  - `zhcn` - [DreamGallery/WDS-Translation-Csv](https://github.com/DreamGallery/WDS-Translation-Csv)
  - `zhcnai` - [huang207/WDS-Translation-Csv](https://github.com/huang207/WDS-Translation-Csv/tree/ai)
  - `zhai` - [littletoxic/wds-translation](https://github.com/littletoxic/wds-translation)
  - `id` - [Ryota537/WDS-Translation-Csv](https://github.com/Ryota537/WDS-Translation-Csv)

Or you can create a new TranslateReader in [translationReader.ts](./src/constant/translationReader.ts) file
  ```ts
  const Reader: TranslateReader = {
      language: "sample", // Name of the language
      url: "", // URL of the translation file
      font: {
          family: "", // Font family
          url: "", // URL of the font file
      },
      read: function (epId: number) { 
        // Define the method to read the translation file
        // If it is a CSV file, you can use loadTranslateModel() to read it.
        // Should return data of type IEpisodeTranslateModel
      },
  };
  TranslationController.addReader(Reader); // Add the reader to the controller
  ```

## Audio record for MediaRecorder

~~Because there is no api for capturing audio from tab output and `MediaRecorder` does not support change stream during recording, global audio is needed for audio recording. Select any window or screen and **check `Also share system audio`** when browser prompt.~~

Audio now capture from streamFilter.

> [!TIP]
> use `--autoplay-policy=no-user-gesture-required` flag to allow auto play audio without user interaction in Chrome.

## Quick Start

```shell
# Install dependencies
yarn install

# Start development server
yarn run dev

# Build for production
yarn run build
```