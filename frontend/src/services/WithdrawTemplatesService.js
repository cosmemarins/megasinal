import axios from './BaseService';

const WITHDRAW_TEMPLATES_URL = `${process.env.REACT_APP_API_URL}/withdrawtemplates/`;

export async function getWithdrawTemplates(coin, page) {
    const withdrawTemplatesUrl = `${WITHDRAW_TEMPLATES_URL}${coin || ''}?page=${page}`;

    
    const response = await axios.get(withdrawTemplatesUrl);
    return response.data;//{count, rows}
}

export async function saveWithdrawTemplate(id, newWithdrawTemplate) {
    
    const regex = /^(\d+([,.]\d+)?)$/;

    if (typeof newWithdrawTemplate.amountMultiplier === 'string' && regex.test(newWithdrawTemplate.amountMultiplier))
        newWithdrawTemplate.amountMultiplier = parseFloat(newWithdrawTemplate.amountMultiplier.replace(',', '.'));

    let response;
    if (id)
        response = await axios.patch(`${WITHDRAW_TEMPLATES_URL}${id}`, newWithdrawTemplate);
    else
        response = await axios.post(WITHDRAW_TEMPLATES_URL, newWithdrawTemplate);
    return response.data;
}

export async function deleteWithdrawTemplate(id) {
    
    const response = await axios.delete(`${WITHDRAW_TEMPLATES_URL}${id}`);
    return response.data;
}