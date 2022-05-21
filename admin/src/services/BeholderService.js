import axios from './BaseService';

const BEHOLDER_URL = `${process.env.REACT_APP_API_URL}/beholder/`;

export async function getIndexes() {
    
    const response = await axios.get(BEHOLDER_URL + 'memory/indexes');
    return response.data;
}

export async function getAnalysisIndexes(){
    
    const response = await axios.get(`${BEHOLDER_URL}analysis/`);
    return response.data;
}

export async function getMemoryIndex(symbol, index, interval) {
    
    const response = await axios.get(`${BEHOLDER_URL}memory/${symbol}/${index}/${interval ? interval : ''}`);
    return response.data;
}

export async function getMemory() {
    
    const response = await axios.get(`${BEHOLDER_URL}memory/`);
    return response.data;
}

export async function getAgenda() {
    
    const response = await axios.get(`${BEHOLDER_URL}agenda/`);
    return response.data;
}

export async function getBrain() {
    
    const response = await axios.get(`${BEHOLDER_URL}brain/`);
    return response.data;
}