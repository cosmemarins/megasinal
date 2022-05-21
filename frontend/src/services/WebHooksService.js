import axios from './BaseService';

const WEBHOOKS_URL = `${process.env.REACT_APP_API_URL}/webhooks/`;

export async function getWebHooks(page) {
    const webHooksUrl = `${WEBHOOKS_URL}?page=${page}`;
    const response = await axios.get(webHooksUrl);
    return response.data;//{count, rows}
}

export async function saveWebHook(id, newWebHook) {
    let response;
    if (id)
        response = await axios.patch(`${WEBHOOKS_URL}${id}`, newWebHook);
    else
        response = await axios.post(WEBHOOKS_URL, newWebHook);
    return response.data;
}

export async function deleteWebHook(id) {
    const response = await axios.delete(`${WEBHOOKS_URL}${id}`);
    return response.data;
}