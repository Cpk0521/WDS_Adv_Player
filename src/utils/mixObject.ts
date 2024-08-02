export function mixObject<T>(target: T, source: Partial<T>): T {
    for (const key in source) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
            if(key in (target as object)){
                target[key] = mixObject(target[key], source[key] as any);
            }
        } 
        else {
            (target as any)[key] = source[key];
        }
    }

    return target;
}
