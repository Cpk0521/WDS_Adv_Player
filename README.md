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
A adventure Player to render the stories for game [ワールドダイスター 夢のステラリウム](https://world-dai-star.com/game).

## Demo
[online Demo](https://cpk0521.github.io/WDS_Adv_Player/?id=1000000)

## URL Parameters

| Parameters  | description | value |
| :-------------: | :-------------: | :-------------:|
|id  | Story Id | |
|tl  | Translate language | zhcn |
|at  | Auto play preset | true |
|renderer  | Renderer Type | `webgl`, `webgpu` |

## Translation

you can create a new TranslateReader in [translationReader.ts](./src/constant/translationReader.ts) file

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