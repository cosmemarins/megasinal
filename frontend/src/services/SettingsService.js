import axios from './BaseService';

const SETTINGS_URL = `${process.env.REACT_APP_API_URL}/settings` || 'http://localhost:3001/settings';

export async function getSettings() {
    const response = await axios.get(SETTINGS_URL);
    return response.data;
}

export async function updateSettings(settings) {
    
    const response = await axios.patch(SETTINGS_URL, settings);
    return response.data;
}