const { log } = console

export function banner(){
    let logtext = [
        `\n\n %c  %c  World Dai Star Adv Player ${__VERSION__}  %c  %c  https://github.com/Cpk0521  %c \n\n`,
        'background: #00ffff; padding:5px 0;',
        'color: #00ffff; background: #030307; padding:5px 0;',
        'background: #00ffff; padding:5px 0;',
        'background: #CCffff; padding:5px 0;',
        'background: #00ffff; padding:5px 0;',
    ];

    log(...logtext);
}

// export const logger = {

//     level : 'all',
    
//     clog(info : string, data: any, level: string, color: string, now: Date) {
//         const levelToNum : {[level : string] : number} = {
//             all: 7,
//             ALL: 7,
//             TRACE: 6,
//             DEBUG: 5,
//             INFO: 4,
//             WARN: 3,
//             ERROR: 2,
//             FATAL: 1,
//             NONE: 0,
//             none: 0
//         }
//         if (levelToNum[level] <= levelToNum[this.level]) {
//             console.log('%c%s%c%s%c%s%c %s',
//                 'color:white;background-color:' + color,
//                 '[' + level + ']',
//                 '',
//                 ' ',
//                 'color:' + color,
//                 '[' + now.toLocaleString() + ']',
//                 '',
//                 info
//             );
//             if (data) {
//                 console.log(data);
//                 console.log('------------------------')
//             }
//         }
//     },

//     trace(info : string, data : any) {
//         const now = new Date();
//         const level = 'TRACE';
//         const color = '#005CAF';
//         this.clog(info, data, level, color, now);
//     },

//     debug(info : string, data : any) {
//         const now = new Date();
//         const level = 'DEBUG';
//         const color = '#0089A7';
//         this.clog(info, data, level, color, now);
//     },

//     info(info : string, data : any) {
//         const now = new Date();
//         const level = 'INFO';
//         const color = '#00896C';
//         this.clog(info, data, level, color, now);
//     },

//     warn(info : string, data : any) {
//         const now = new Date();
//         const level = 'WARN';
//         const color = '#DDA52D';
//         this.clog(info, data, level, color, now);
//     },

//     error(info : string, data : any) {
//         const now = new Date();
//         const level = 'ERROR';
//         const color = '#AB3B3A';
//         this.clog(info, data, level, color, now);
//     },

//     fatal(info : string, data : any) {
//         const now = new Date();
//         const level = 'FATAL';
//         const color = '#E16B8C';
//         this.clog(info, data, level, color, now);
//     },
// }