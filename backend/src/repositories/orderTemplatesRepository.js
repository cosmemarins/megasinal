const orderTemplateModel = require('../models/orderTemplateModel');
const Sequelize = require('sequelize');

function insertOrderTemplate(newOrderTemplate, transaction) {
    return orderTemplateModel.create(newOrderTemplate, { transaction });
}

function deleteOrderTemplate(userId, id) {
    return orderTemplateModel.destroy({ where: { id, userId } });
}

function deleteAll(userId, transaction) {
    return orderTemplateModel.destroy({
        where: { userId },
        transaction
    })
}

function getOrderTemplates(userId, symbol, page = 1) {
    const options = {
        where: { userId },
        order: [['symbol', 'ASC'], ['name', 'ASC']],
        limit: 10,
        offset: 10 * (page - 1),
        distinct: true
    };

    if (symbol) {
        if (symbol.length < 6)
            options.where = { userId, symbol: { [Sequelize.Op.like]: `%${symbol}%` } }
        else
            options.where = { userId, symbol }
    }

    return orderTemplateModel.findAndCountAll(options);
}

async function getOrderTemplate(userId, id) {
    return orderTemplateModel.findOne({ where: { id, userId } });
}

async function updateOrderTemplate(userId, id, newOrderTemplate) {

    const currentOrderTemplate = await getOrderTemplate(userId, id);
    if (!currentOrderTemplate) throw new Error(`There is no order template with these params: {userId: ${userId}, id: ${id}}.`);

    if (newOrderTemplate.name && newOrderTemplate.name !== currentOrderTemplate.name)
        currentOrderTemplate.name = newOrderTemplate.name;

    if (newOrderTemplate.type && newOrderTemplate.type !== currentOrderTemplate.type)
        currentOrderTemplate.type = newOrderTemplate.type;

    if (newOrderTemplate.side && newOrderTemplate.side !== currentOrderTemplate.side)
        currentOrderTemplate.side = newOrderTemplate.side;

    if (newOrderTemplate.limitPrice && newOrderTemplate.limitPrice !== currentOrderTemplate.limitPrice)
        currentOrderTemplate.limitPrice = newOrderTemplate.limitPrice;

    if (newOrderTemplate.limitPriceMultiplier && newOrderTemplate.limitPriceMultiplier !== currentOrderTemplate.limitPriceMultiplier)
        currentOrderTemplate.limitPriceMultiplier = newOrderTemplate.limitPriceMultiplier;

    if (newOrderTemplate.stopPrice && newOrderTemplate.stopPrice !== currentOrderTemplate.stopPrice)
        currentOrderTemplate.stopPrice = newOrderTemplate.stopPrice;

    if (newOrderTemplate.stopPriceMultiplier && newOrderTemplate.stopPriceMultiplier !== currentOrderTemplate.stopPriceMultiplier)
        currentOrderTemplate.stopPriceMultiplier = newOrderTemplate.stopPriceMultiplier;

    if (newOrderTemplate.quantity && newOrderTemplate.quantity !== currentOrderTemplate.quantity)
        currentOrderTemplate.quantity = newOrderTemplate.quantity;

    if (newOrderTemplate.quantityMultiplier && newOrderTemplate.quantityMultiplier !== currentOrderTemplate.quantityMultiplier)
        currentOrderTemplate.quantityMultiplier = newOrderTemplate.quantityMultiplier;

    if (newOrderTemplate.icebergQty && newOrderTemplate.icebergQty !== currentOrderTemplate.icebergQty)
        currentOrderTemplate.icebergQty = newOrderTemplate.icebergQty;

    if (newOrderTemplate.icebergQtyMultiplier && newOrderTemplate.icebergQtyMultiplier !== currentOrderTemplate.icebergQtyMultiplier)
        currentOrderTemplate.icebergQtyMultiplier = newOrderTemplate.icebergQtyMultiplier;

    await currentOrderTemplate.save();
    return currentOrderTemplate;
}

function deleteOrderTemplatesByGridName(userId, gridName, transaction) {
    const likeName = gridName.split('#')[0];
    return orderTemplateModel.destroy({
        where: { userId, name: { [Sequelize.Op.like]: `${likeName}#%` } },
        transaction
    })
}


function getOrderTemplatesByGridName(userId, gridName) {
    const likeName = gridName.split('#')[0];
    return orderTemplateModel.findAll({
        where: { userId, name: { [Sequelize.Op.like]: `${likeName}#%` } }
    })
}

function getAllOrderTemplates(userId, symbol) {
    const options = { where: { userId, symbol } };

    if (symbol.startsWith('*'))
        options.where.symbol = { [Sequelize.Op.like]: `%${symbol.replace('*', '')}` }

    return orderTemplateModel.findAll(options);
}

module.exports = {
    getOrderTemplate,
    getOrderTemplates,
    insertOrderTemplate,
    updateOrderTemplate,
    deleteOrderTemplate,
    deleteAll,
    deleteOrderTemplatesByGridName,
    getOrderTemplatesByGridName,
    getAllOrderTemplates
}