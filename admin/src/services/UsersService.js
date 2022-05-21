import axios from './BaseService';

const USERS_URL = `${process.env.REACT_APP_API_URL}/users/`;

export async function getActiveUsers() {
    
    const response = await axios.get(`${USERS_URL}active`);
    return response.data;
}

export async function getUsers(search, page) {
    const usersUrl = `${USERS_URL}${search ? search : ''}?page=${page}`;

    
    const response = await axios.get(usersUrl);
    return response.data;//{count, rows}
}

export async function saveUser(id, newUser) {
    
    let response;
    if (id)
        response = await axios.patch(`${USERS_URL}${id}`, newUser);
    else
        response = await axios.post(USERS_URL, newUser);
    return response.data;
}

export async function deleteUser(id) {
    
    const response = await axios.delete(`${USERS_URL}${id}`);
    return response.data;
}

export async function startUser(id) {
    
    const response = await axios.post(`${USERS_URL}${id}/start`, {});
    return response.data;
}

export async function stopUser(id) {
    
    const response = await axios.post(`${USERS_URL}${id}/stop`, {});
    return response.data;
}

export async function resetUserPassword(id) {
    
    const response = await axios.post(`${USERS_URL}${id}/reset`, {});
    return response.data;
}