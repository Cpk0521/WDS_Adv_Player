declare const __DEV__: boolean;
declare const __VERSION__: string;

declare module '*?raw' {
    const content : string;
    export default content;
}

declare module 'csv-to-js-parser' {
    export function csvToObj(data : string, delimeter? : string, description?: any[])
}