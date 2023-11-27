async function loadJson<T extends Object>(source : string) : Promise<T>{
    return fetch(source)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            return response.json() as Promise<T>;
        })
}

export default loadJson