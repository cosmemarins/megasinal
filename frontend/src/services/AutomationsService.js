import axios from './BaseService';

const AUTOMATIONS_URL = `${process.env.REACT_APP_API_URL}/automations/`;

export async function getAutomations(page) {
    const automationsUrl = `${AUTOMATIONS_URL}?page=${page}`;
    const response = await axios.get(automationsUrl);
    return response.data;//{count, rows}
}

export async function getAutomationsBySymbol(symbol) {
    const automationsUrl = `${AUTOMATIONS_URL}?symbol=${symbol}`;
    const response = await axios.get(automationsUrl);
    return response.data;
}

export async function getAllAutomations() {
    const automationsUrl = `${AUTOMATIONS_URL}all`;
    const response = await axios.get(automationsUrl);
    return response.data;
}

export async function getAutomation(id) {
    const response = await axios.get(`${AUTOMATIONS_URL}${id}`);
    return response.data;
}

export async function saveAutomation(id, newAutomation) {
    let response;
    if (id)
        response = await axios.patch(`${AUTOMATIONS_URL}${id}`, newAutomation);
    else
        response = await axios.post(AUTOMATIONS_URL, newAutomation);
    return response.data;
}

export async function saveGrid(id, newAutomation, levels, quantity, token) {
    let response;
    if (id)
        response = await axios.patch(`${AUTOMATIONS_URL}${id}?levels=${levels}&quantity=${quantity}`, newAutomation);
    else
        response = await axios.post(`${AUTOMATIONS_URL}?levels=${levels}&quantity=${quantity}`, newAutomation);
    return response.data;
}

export async function deleteAutomation(id) {
    const response = await axios.delete(`${AUTOMATIONS_URL}${id}`);
    return response.data;
}

export async function startAutomation(id) {
    const response = await axios.post(`${AUTOMATIONS_URL}${id}/start`, {});
    return response.data;
}

export async function stopAutomation(id) {
    const response = await axios.post(`${AUTOMATIONS_URL}${id}/stop`, {});
    return response.data;
}

export async function doBacktest(newBacktest) {
    delete newBacktest.results;

    newBacktest.startTime = new Date(newBacktest.startTime).getTime();
    newBacktest.endTime = new Date(newBacktest.endTime).getTime();

    const response = await axios.post(`${AUTOMATIONS_URL}backtest`, newBacktest);
    return response.data;
}