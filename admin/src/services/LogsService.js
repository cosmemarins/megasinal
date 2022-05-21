import axios from './BaseService';

const LOGS_URL = `${process.env.REACT_APP_API_URL}/logs/`;

export async function getLogs(file) {
    
    const response = await axios.get(LOGS_URL + file);
    return response.data;
}

export async function getLogList(userId, page) {
    
    const response = await axios.get(`${LOGS_URL}?page=${page}&userId=${userId ? userId : ''}`);
    return response.data;
}