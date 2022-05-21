import axios from './BaseService';
import { getDefaultFiat } from '../components/SelectFiat/SelectFiat';

const EXCHANGE_URL = `${process.env.REACT_APP_API_URL}/exchange/`;

export const STOP_TYPES = ["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"];

export const FINISHED_STATUS = ["FILLED", "REJECTED", "CANCELED"];

export async function getBalance() {
    
    const response = await axios.get(EXCHANGE_URL + 'balance/' + getDefaultFiat());
    return response.data;
}

export async function getFullBalance(fiat) {
    
    const response = await axios.get(EXCHANGE_URL + 'balance/full/' + fiat);
    return response.data;
}

export async function getCoins() {
    
    const response = await axios.get(EXCHANGE_URL + 'coins');
    return response.data;
}

export async function doWithdraw(withdrawTemplateId) {
    
    const response = await axios.post(`${EXCHANGE_URL}withdraw/${withdrawTemplateId}`, null);
    return response.data;
}
