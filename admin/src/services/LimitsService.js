import axios from './BaseService';

const LIMITS_URL = `${process.env.REACT_APP_API_URL}/limits/`;

export async function getLimits(page, token) {
    const url = `${LIMITS_URL}?page=${page}`;

    
    const response = await axios.get(url);
    return response.data;//{count, rows}
}

export async function getAllLimits(token) {
    
    const response = await axios.get(`${LIMITS_URL}all`);
    return response.data;
}

export async function getActiveLimits() {
    
    const response = await axios.get(`${LIMITS_URL}active`);
    return response.data;
}

export async function saveLimit(id, newLimit) {
    
    let response;
    if (id)
        response = await axios.patch(`${LIMITS_URL}${id}`, newLimit);
    else
        response = await axios.post(LIMITS_URL, newLimit);
    return response.data;
}

export async function deleteLimit(id) {
    
    const response = await axios.delete(`${LIMITS_URL}${id}`);
    return response.data;
}

export async function startLimit(id) {
    
    const response = await axios.patch(`${LIMITS_URL}${id}`, { isActive: true });
    return response.data;
}

export async function stopLimit(id) {
    
    const response = await axios.patch(`${LIMITS_URL}${id}`, { isActive: false });
    return response.data;
}