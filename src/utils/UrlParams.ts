export function getUrlParams(params: string | string[]) : {[param : string] : string | undefined}{
    if(typeof params === 'string'){
        params = [ params ]
    }

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    
    let result : {[param : string] : string | undefined} = {}
    params.forEach(param => result[param] = urlParams.get(param) || undefined)

    return result
}