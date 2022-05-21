import axios from './BaseService';

const MEGASINAL_URL = `${process.env.REACT_APP_API_URL}/hydra/`;

export async function getDashboard() {
    
    const response = await axios.get(MEGASINAL_URL + 'dashboard');
    return response.data;
}