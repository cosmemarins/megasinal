const settingsRepository = require('../repositories/settingsRepository');
const ordersRepository = require('../repositories/ordersRepository');
const usersRepository = require('../repositories/usersRepository');
const orderTemplatesRepository = require('../repositories/orderTemplatesRepository');
const automationsRepository = require('../repositories/automationsRepository');
const actionsRepository = require('../repositories/actionsRepository');
const db = require('../db');
const appEm = require('../app-em');
const hydra = require('../hydra');
const logger = require('../utils/logger');

async function getOrder(req, res, next) {
    const userId = res.locals.token.id;
    const { orderId, clientOrderId } = req.params;
    const order = await ordersRepository.getOrder(orderId, clientOrderId);
    if (order.userId !== userId) return res.sendStatus(403);
    res.json(order);
}

async function getOrders(req, res, next) {
    const userId = res.locals.token.id;
    const symbol = req.params.symbol && req.params.symbol.toUpperCase();
    const page = parseInt(req.query.page);
    const orders = await ordersRepository.getOrders(userId, symbol, page || 1);
    res.json(orders);
}

function saveTrailingOrderTemplate(order, timestamp, userId, transaction) {
    const stopPriceMultiplier = parseFloat(order.options.stopPriceMultiplier);
    const orderTemplate = {
        name: `TRAILING ${order.side} ${timestamp}`,
        symbol: order.symbol,
        type: order.options.type,
        side: order.side,
        limitPrice: order.limitPrice,
        limitPriceMultiplier: 1,
        stopPriceMultiplier,
        quantity: order.quantity,
        quantityMultiplier: 1,
        icebergQtyMultiplier: 1,
        userId
    }
    return orderTemplatesRepository.insertOrderTemplate(orderTemplate, transaction);
}

function saveTrailingAutomation(order, timestamp, userId, transaction) {
    const conditions = order.side === 'BUY'
        ? `MEMORY['${order.symbol}:BOOK'].current.bestAsk<=${order.limitPrice}`
        : `MEMORY['${order.symbol}:BOOK'].current.bestBid>=${order.limitPrice}`;

    const automation = {
        name: `TRAILING ${order.side} ${timestamp}`,
        symbol: order.symbol,
        indexes: `${order.symbol}:BOOK`,
        conditions,
        isActive: true,
        logs: false,
        userId
    }
    return automationsRepository.insertAutomation(automation, transaction);
}

function saveTrailingAction(automationId, orderTemplateId, transaction) {
    const action = {
        type: 'TRAILING',
        automationId,
        orderTemplateId
    }
    return actionsRepository.insertActions([action], transaction);
}

async function placeTrailingStop(userId, order) {

    const transaction = await db.transaction();
    const timestamp = Date.now();
    let automation;

    try {
        const orderTemplate = await saveTrailingOrderTemplate(order, timestamp, userId, transaction)

        automation = await saveTrailingAutomation(order, timestamp, userId, transaction);

        await saveTrailingAction(automation.id, orderTemplate.id, transaction);

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }

    automation = await automationsRepository.getAutomation(automation.id);

    hydra.updateBrain(automation);
    
    await appEm.sendMessage(userId, { notification: { type: 'success', text: 'Trailing Stop placed successfully!' } });
}

async function placeOrder(req, res, next) {
    const userId = res.locals.token.id;

    if (req.body.options.type === 'TRAILING_STOP') {
        const order = req.body;

        try {
            await placeTrailingStop(userId, order);
            return res.status(202).send(`Trailing Stop placed successfully!`);
        } catch (err) {
            logger('system', err);
            return res.status(500).json(err.message);
        }
    }

    const user = await usersRepository.getUserDecrypted(userId);
    const settings = await settingsRepository.getDefaultSettings();
    const exchange = require('../utils/exchange')(settings.get({ plain: true }), user.get({ plain: true }));

    const { side, symbol, quantity, limitPrice, options, automationId } = req.body;

    let result;

    try {
        if (side === 'BUY')
            result = await exchange.buy(symbol, quantity, limitPrice, options);
        else if (side === 'SELL')
            result = await exchange.sell(symbol, quantity, limitPrice, options);
    }
    catch (err) {
        return res.status(400).json(err.body);
    }

    const order = await ordersRepository.insertOrder({
        automationId,
        userId,
        symbol,
        quantity,
        type: options ? options.type : 'MARKET',
        side,
        limitPrice,
        stopPrice: options ? options.stopPrice : null,
        icebergQty: options ? options.icebergQty : null,
        orderId: result.orderId,
        clientOrderId: result.clientOrderId,
        transactTime: result.transactTime,
        status: result.status || 'NEW'
    })

    res.status(201).json(order.get({ plain: true }));
}

async function cancelOrder(req, res, next) {
    const userId = res.locals.token.id;
    const user = await usersRepository.getUserDecrypted(userId);
    const settings = await settingsRepository.getDefaultSettings();
    const exchange = require('../utils/exchange')(settings, user);

    const { symbol, orderId } = req.params;

    let result;
    try {
        result = await exchange.cancel(symbol, orderId);
    }
    catch (err) {
        return res.status(400).json(err.body);
    }

    const order = await ordersRepository.updateOrderByOrderId(result.orderId, result.origClientOrderId, {
        status: result.status
    })
    res.json(order.get({ plain: true }));
}

async function syncOrder(req, res, next) {
    const userId = res.locals.token.id;
    const user = await usersRepository.getUserDecrypted(userId);
    const settings = await settingsRepository.getDefaultSettings();
    const exchange = require('../utils/exchange')(settings, user);

    const beholderOrderId = req.params.id;
    const order = await ordersRepository.getOrderById(beholderOrderId);
    if (!order) return res.sendStatus(404);

    let binanceOrder, binanceTrade;
    try {
        binanceOrder = await exchange.orderStatus(order.symbol, order.orderId);
        order.status = binanceOrder.status;
        order.transactTime = binanceOrder.updateTime;

        if (binanceOrder.status !== 'FILLED') {
            await order.save();
            return res.json(order);
        }

        binanceTrade = await exchange.orderTrade(order.symbol, order.orderId);
    }
    catch (err) {
        logger('system', err);
        return res.sendStatus(404);
    }

    const quoteQuantity = parseFloat(binanceOrder.cummulativeQuoteQty);
    order.avgPrice = quoteQuantity / parseFloat(binanceOrder.executedQty);
    order.isMaker = binanceTrade.isMaker;
    order.commission = binanceTrade.commission;

    const isQuoteComission = binanceTrade.commissionAsset && order.symbol.endsWith(binanceTrade.commissionAsset);
    if (isQuoteComission)
        order.net = quoteQuantity - parseFloat(binanceTrade.commission);
    else
        order.net = quoteQuantity;

    await order.save();

    res.json(order);
}

async function getLastOrders(req, res, next) {
    const userId = res.locals.token.id;
    const orders = await ordersRepository.getLastFilledOrders(userId);
    res.json(orders);
}

function calcVolume(orders, side, startTime, endTime) {
    startTime = !startTime ? 0 : startTime;
    endTime = !endTime ? Date.now() : endTime;

    const filteredOrders = orders.filter(o => o.transactTime >= startTime && o.transactTime < endTime && o.side === side);
    if (!filteredOrders || !filteredOrders.length) return 0;

    return filteredOrders.map(o => parseFloat(o.net))
        .reduce((a, b) => a + b);
}

function thirtyDaysAgo() {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 30);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
}

function getStartToday() {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
}

function getToday() {
    const date = new Date();
    date.setUTCHours(23, 59, 59, 999);
    return date.getTime();
}

async function getOrdersReport(req, res, next) {
    if (req.query.date)
        return getDayTradeReport(req, res, next);
    else
        return getMonthReport(req, res, next);
}

const EMPTY_REPORT = {
    orders: 0,
    buyVolume: 0,
    sellVolume: 0,
    wallet: 0,
    profit: 0,
    profitPerc: 0,
    subs: [],
    series: [],
    automations: []
}

function groupByAutomations(orders) {
    const automationsObj = {};
    orders.forEach(o => {
        const automationId = o.automationId ? o.automationId : 'M';
        if (!automationsObj[automationId])
            automationsObj[automationId] = { name: o.automationId ? o['automation.name'] : 'Others', executions: 1, net: 0 };
        else
            automationsObj[automationId].executions++;

        if (o.side === 'BUY')
            automationsObj[automationId].net -= parseFloat(o.net);
        else
            automationsObj[automationId].net += parseFloat(o.net);
    })

    return Object.entries(automationsObj).map(prop => prop[1]).sort((a, b) => b.net - a.net);
}

async function getDayTradeReport(req, res, next) {
    const userId = res.locals.token.id;
    const quote = req.params.quote;

    let startDate = req.query.date ? parseInt(req.query.date) : getStartToday();
    let endDate = startDate + (23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000) + 999;

    //permitir apenas 24h
    if ((endDate - startDate) > (1 * 24 * 60 * 60 * 1000)) startDate = getStartToday();

    const orders = await ordersRepository.getReportOrders(userId, quote, startDate, endDate);
    if (!orders || !orders.length) return res.json({ ...EMPTY_REPORT, quote, startDate, endDate });

    const subs = [];
    const series = [];
    for (let i = 0; i < 24; i++) {
        const newDate = new Date(startDate);
        newDate.setUTCHours(i, 0, 0, 0);
        subs.push(`${i}h`);

        const lastMoment = new Date(newDate.getTime())
        lastMoment.setUTCMinutes(59, 59, 999);

        const partialBuy = calcVolume(orders, 'BUY', newDate.getTime(), lastMoment.getTime());
        const partialSell = calcVolume(orders, 'SELL', newDate.getTime(), lastMoment.getTime());
        series.push(partialSell - partialBuy);
    }

    const buyVolume = calcVolume(orders, 'BUY');
    const sellVolume = calcVolume(orders, 'SELL');
    const profit = sellVolume - buyVolume;

    const wallet = await hydra.getMemory(quote, 'WALLET_' + userId);
    const profitPerc = (profit * 100) / (parseFloat(wallet) - profit);
    const automations = groupByAutomations(orders);

    res.json({
        quote,
        orders: orders.length,
        buyVolume,
        sellVolume,
        wallet,
        profit,
        profitPerc,
        startDate,
        endDate,
        subs,
        series,
        automations
    })
}

async function getMonthReport(req, res, next) {
    const userId = res.locals.token.id;
    const quote = req.params.quote;

    let startDate = req.query.startDate ? parseInt(req.query.startDate) : thirtyDaysAgo();
    let endDate = req.query.endDate ? parseInt(req.query.endDate) : getToday();

    //permitir apenas 30 dias
    if ((endDate - startDate) > (31 * 24 * 60 * 60 * 1000)) startDate = thirtyDaysAgo();

    const orders = await ordersRepository.getReportOrders(userId, quote, startDate, endDate);
    if (!orders || !orders.length) return res.json({ ...EMPTY_REPORT, quote, startDate, endDate });

    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const subs = [];
    const series = [];
    for (let i = 0; i < daysInRange; i++) {
        const newDate = new Date(startDate);
        newDate.setUTCDate(newDate.getUTCDate() + i);
        subs.push(`${newDate.getUTCDate()}/${newDate.getUTCMonth() + 1}`);

        const lastMoment = new Date(newDate.getTime())
        lastMoment.setUTCHours(23, 59, 59, 999);

        const partialBuy = calcVolume(orders, 'BUY', newDate.getTime(), lastMoment.getTime());
        const partialSell = calcVolume(orders, 'SELL', newDate.getTime(), lastMoment.getTime());
        series.push(partialSell - partialBuy);
    }

    const buyVolume = calcVolume(orders, 'BUY');
    const sellVolume = calcVolume(orders, 'SELL');
    const profit = sellVolume - buyVolume;

    const wallet = await hydra.getMemory(quote, 'WALLET_' + userId);
    const profitPerc = (profit * 100) / (parseFloat(wallet) - profit);
    const automations = groupByAutomations(orders);

    res.json({
        quote,
        orders: orders.length,
        buyVolume,
        sellVolume,
        wallet,
        profit,
        profitPerc,
        startDate,
        endDate,
        subs,
        series,
        automations
    })
}

module.exports = {
    placeOrder,
    cancelOrder,
    getOrders,
    syncOrder,
    getLastOrders,
    getOrdersReport,
    getOrder,
    placeTrailingStop
}