import { displaypPeference } from "./createApp";
const { log } = console

export function banner(){
    let logtext = [
        `\n\n %c  %c  World Dai Star Adv Player ${__VERSION__} (${displaypPeference}) %c  %c  https://github.com/Cpk0521  %c \n\n`,
        'background: #00ffff; padding:5px 0;',
        'color: #00ffff; background: #030307; padding:5px 0;',
        'background: #00ffff; padding:5px 0;',
        'background: #CCffff; padding:5px 0;',
        'background: #00ffff; padding:5px 0;',
    ];

    log(...logtext);
}

export function TrackLog(current: number, length: number, Track: object) {
    log(
        ...[
            "%c%s%c%s%c%s",
            "color:white;background:#23c4ed",
            "【Track】",
            "",
            " ",
            "color:#23c4ed",
            `[${current}/${length}]`,
            Track,
        ]
    );
}