import axios from './BaseService';

const STRATEGIES_URL = `${process.env.REACT_APP_API_URL}/strategies/`;

export async function getStrategies(symbol = '', page = 1) {
    const strategiesUrl = `${STRATEGIES_URL}?page=${page}&symbol=${symbol}`;
    const response = await axios.get(strategiesUrl);
    return response.data;//{count, rows}
}

export async function getSharedStrategies(symbol = '', includePublic = true, page = 1) {
    const strategiesUrl = `${STRATEGIES_URL}shared?page=${page}&symbol=${symbol}&public=${includePublic}`;
    const response = await axios.get(strategiesUrl);
    return response.data;//{count, rows}
}

export async function saveStrategy(id, newStrategy) {
    let response;
    if (id)
        response = await axios.patch(`${STRATEGIES_URL}${id}`, newStrategy);
    else
        response = await axios.post(STRATEGIES_URL, newStrategy);
    return response.data;
}

export async function deleteStrategy(id) {
    const response = await axios.delete(`${STRATEGIES_URL}${id}`);
    return response.data;
}

export async function startStrategy(id) {
    const response = await axios.post(`${STRATEGIES_URL}${id}/start`, {});
    return response.data;
}

export async function stopStrategy(id) {
    const response = await axios.post(`${STRATEGIES_URL}${id}/stop`, {});
    return response.data;
}

export async function copyStrategy(id) {
    const response = await axios.post(`${STRATEGIES_URL}${id}/copy`, {});
    return response.data;
}