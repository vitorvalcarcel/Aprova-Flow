export const state = {
    materiasCache: [],
    tiposEstudoCache: [],
    registrosGlobais: []
};

export function setMateriasCache(data) {
    state.materiasCache = data;
}

export function setTiposEstudoCache(data) {
    state.tiposEstudoCache = data;
}

export function setRegistrosGlobais(data) {
    state.registrosGlobais = data;
}
