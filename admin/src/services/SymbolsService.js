import axios from './BaseService';

const SYMBOLS_URL = `${process.env.REACT_APP_API_URL}/symbols`;

export async function getSymbols(onlyFavorites) {
    
    const response = await axios.get(`${SYMBOLS_URL}?onlyFavorites=${onlyFavorites}`);
    return response.data;
}

export async function searchSymbols(search, page) {
    
    const response = await axios.get(`${SYMBOLS_URL}/?search=${search}&page=${page}&pageSize=20`);
    return response.data;
}

export async function getSymbol(symbol) {
    
    const response = await axios.get(`${SYMBOLS_URL}/${symbol}`);
    return response.data;
}

export async function updateSymbol(symbolData) {
    
    const response = await axios.patch(`${SYMBOLS_URL}/${symbolData.symbol}`, symbolData);
    return response.data;
}

export async function syncSymbols() {
    
    const response = await axios.post(`${SYMBOLS_URL}/sync`, {});
    return response.data;
}
