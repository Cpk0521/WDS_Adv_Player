export function checkImplements<T>(obj: any): obj is T {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    const keys = Object.keys(obj) as (keyof T)[];
    keys.forEach(key => {if(!(key in obj)) return false;})
    
    return true;
}

export function isURL(url : string){
    try{
        return Boolean(new URL(url));
    }
    catch(e){
        return false;
    }
}