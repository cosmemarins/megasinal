const orderModel = require('../models/orderModel');
const Sequelize = require('sequelize');
const automationModel = require('../models/automationModel');

const orderStatus = {
    FILLED: 'FILLED',
    PARTIALLY_FILLED: 'PARTIALLY_FILLED',
    CANCELED: 'CANCELED',
    REJECTED: 'REJECTED',
    NEW: 'NEW'
}

function insertOrder(newOrder) {
    return orderModel.create(newOrder);
}

function getOrders(userId, symbol, page = 1) {
    const options = {
        where: { userId },
        order: [['id', 'DESC']],
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

    options.include = automationModel;

    return orderModel.findAndCountAll(options);
}

async function getAveragePrices(userId) {
    const result = await orderModel.findAll({
        where: { side: 'BUY', status: 'FILLED', net: {[Sequelize.Op.gt]:0}, userId },
        group: 'symbol',
        attributes: [
            [Sequelize.fn('max', Sequelize.col('symbol')), 'symbol'],
            [Sequelize.fn('sum', Sequelize.col('net')), 'net'],
            [Sequelize.fn('sum', Sequelize.col('quantity')), 'qty']
        ],
        raw: true
    });

    return result.map(r => {
        return {
            symbol: r.symbol,
            net: parseFloat(r.net),
            qty: parseFloat(r.qty),
            avg: parseFloat(r.net) / parseFloat(r.qty)
        }
    });
}

async function getOrderById(id) {
    const order = await orderModel.findOne({ where: { id }, include: automationModel });
    return order;
}

async function getOrder(orderId, clientOrderId) {
    const order = await orderModel.findOne({ where: { orderId, clientOrderId }, include: automationModel });
    return order;
}

async function updateOrderById(id, newOrder) {
    const order = await getOrderById(id);
    if (!order) return false;
    return updateOrder(order, newOrder);
}

async function updateOrderByOrderId(orderId, clientOrderId, newOrder) {
    const order = await getOrder(orderId, clientOrderId);
    if (!order) return false;
    return updateOrder(order, newOrder);
}

async function updateOrder(currentOrder, newOrder) {
    if (!currentOrder || !newOrder) return false;

    if (newOrder.status &&
        newOrder.status !== currentOrder.status &&
        (currentOrder.status === 'NEW' || currentOrder.status === 'PARTIALLY_FILLED'))
        currentOrder.status = newOrder.status;//somente dá para atualizar ordens não finalizadas

    if (newOrder.avgPrice && newOrder.avgPrice !== currentOrder.avgPrice)
        currentOrder.avgPrice = newOrder.avgPrice;

    if (newOrder.isMaker !== null && newOrder.isMaker !== undefined && newOrder.isMaker !== currentOrder.isMaker)
        currentOrder.isMaker = newOrder.isMaker;

    if (newOrder.obs && newOrder.obs !== currentOrder.obs)
        currentOrder.obs = newOrder.obs;

    if (newOrder.transactTime && newOrder.transactTime !== currentOrder.transactTime)
        currentOrder.transactTime = newOrder.transactTime;

    if (newOrder.commission && newOrder.commission !== currentOrder.commission)
        currentOrder.commission = newOrder.commission;

    if (newOrder.net && newOrder.net !== currentOrder.net)
        currentOrder.net = newOrder.net;

    await currentOrder.save();
    return currentOrder;
}

async function getLastFilledOrders(userId) {
    const idObjects = await orderModel.findAll({
        where: { userId, status: 'FILLED' },
        group: 'symbol',
        attributes: [Sequelize.fn('max', Sequelize.col('id'))],
        raw: true
    });
    const ids = idObjects.map(o => Object.values(o)).flat();

    return orderModel.findAll({ where: { id: ids } });
}

async function removeAutomationFromOrders(automationId, transaction) {
    return orderModel.update({
        automationId: null
    }, {
        where: { automationId },
        transaction
    })
}

function getReportOrders(userId, quoteAsset, startDate, endDate) {
    startDate = startDate ? startDate : 0;
    endDate = endDate ? endDate : Date.now();
    return orderModel.findAll({
        where: {
            userId,
            symbol: { [Sequelize.Op.like]: `%${quoteAsset}` },
            transactTime: { [Sequelize.Op.between]: [startDate, endDate] },
            status: 'FILLED',
            net: { [Sequelize.Op.gt]: 0 }
        },
        order: [['transactTime', 'ASC']],
        include: automationModel,
        raw: true,
        distinct: true
    });
}

function deleteAll(userId, transaction) {
    return orderModel.destroy({
        where: { userId },
        transaction
    })
}

function get24hOrdersQty() {
    const startDate = new Date();
    startDate.setHours(-24);

    return orderModel.count({
        where: {
            transactTime: { [Sequelize.Op.gt]: startDate.getTime() }
        }
    })
}

const STOP_TYPES = ["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"];

const LIMIT_TYPES = ["LIMIT", "STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT"];

module.exports = {
    orderStatus,
    STOP_TYPES,
    LIMIT_TYPES,
    insertOrder,
    get24hOrdersQty,
    getOrders,
    getOrder,
    getOrderById,
    deleteAll,
    updateOrderById,
    getLastFilledOrders,
    updateOrderByOrderId,
    getReportOrders,
    removeAutomationFromOrders,
    getAveragePrices
}
