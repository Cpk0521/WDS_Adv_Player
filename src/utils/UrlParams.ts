export function getUrlParams(): { [param: string]: string | undefined } {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    return Object.fromEntries(urlParams.entries());
}
