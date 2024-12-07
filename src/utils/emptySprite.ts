import { Texture, Sprite } from "pixi.js"

export interface EmptySpriteOptions {
    color : number,
    alpha : number,
    width : number,
    height : number,
    empty : boolean,
}

export function createEmptySprite(options? : Partial<EmptySpriteOptions>) : Sprite {
    let sprite = options?.empty ? new Sprite(Texture.EMPTY) : new Sprite(Texture.WHITE);
    sprite.width = options?.width || 1920;
    sprite.height = options?.height || 1080;
    sprite.anchor.set(0.5);
    sprite.position.set((options?.width || 1920) /2 , (options?.height || 1080) /2);
    sprite.alpha = options?.alpha ?? 1;

    if(options?.color != undefined) {
        sprite.tint = options.color;
    }

    return sprite;
}

export default createEmptySprite