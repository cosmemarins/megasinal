import axios from './BaseService';

const MONITORS_URL = `${process.env.REACT_APP_API_URL}/monitors/`;

export async function getMonitorsBySymbol(symbol) {
    const monitorsUrl = `${MONITORS_URL}?symbol=${symbol}`;
    const response = await axios.get(monitorsUrl);
    return response.data;
}

export async function getMonitors(page) {
    const monitorsUrl = `${MONITORS_URL}?page=${page}`;
    const response = await axios.get(monitorsUrl);
    return response.data;//{count, rows}
}

export async function getMonitor(id) {
    const response = await axios.get(`${MONITORS_URL}${id}`);
    return response.data;
}

export async function saveMonitor(id, newMonitor) {
    let response;
    if (id)
        response = await axios.patch(`${MONITORS_URL}${id}`, newMonitor);
    else
        response = await axios.post(MONITORS_URL, newMonitor);
    return response.data;
}

export async function deleteMonitor(id) {
    const response = await axios.delete(`${MONITORS_URL}${id}`);
    return response.data;
}

export async function startMonitor(id) {
    const response = await axios.post(`${MONITORS_URL}${id}/start`, {});
    return response.data;
}

export async function stopMonitor(id) {
    const response = await axios.post(`${MONITORS_URL}${id}/stop`, {});
    return response.data;
}