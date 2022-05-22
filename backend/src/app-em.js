const ordersRepository = require('./repositories/ordersRepository');
const { orderStatus } = require('./repositories/ordersRepository');
const { monitorTypes, getActiveSystemMonitors } = require('./repositories/monitorsRepository');
const { execCalc, indexKeys } = require('./utils/indexes');
const logger = require('./utils/logger');
const push = require('./utils/push');

let WSS, hydra, anonymousExchange;

function startMiniTickerMonitor(monitorId, broadcastLabel, logs) {
    if (!anonymousExchange) return new Error('Exchange Monitor not initialized yet.');
    anonymousExchange.miniTickerStream(async (markets) => {
        if (logs) logger('M:' + monitorId, markets);

        try {
            Object.entries(markets).map(async (mkt) => {
                await hydra.updateMemory(mkt[0], indexKeys.MINI_TICKER, null, mkt[1]);
            })

            if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: markets });
        } catch (err) {
            if (logs) logger('M:' + monitorId, err)
        }
    })
    logger('M:' + monitorId, 'Mini Ticker Monitor has started!');
}

let book = [];
function startBookMonitor(monitorId, broadcastLabel, logs) {
    if (!anonymousExchange) return new Error('Exchange Monitor not initialized yet.');
    anonymousExchange.bookStream(async (order) => {
        if (logs) logger('M:' + monitorId, order);

        try {
            if (book.length === 200) {
                if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: book });
                book = [];
            }
            else book.push({ ...order });

            await hydra.updateMemory(order.symbol, indexKeys.BOOK, null, order);
        } catch (err) {
            if (logs) logger('M:' + monitorId, err);
        }
    })
    logger('M:' + monitorId, 'Book Monitor has started!');
}

async function loadWallet(settings, user) {
    const exchange = require('./utils/exchange')(settings, user);

    try {
        const info = await exchange.balance();

        const wallet = Object.entries(info).map(async (item) => {
            await hydra.updateMemory(item[0], `${indexKeys.WALLET}_${user.id}`, null, parseFloat(item[1].available));

            return {
                symbol: item[0],
                available: item[1].available,
                onOrder: item[1].onOrder
            }
        })
        return Promise.all(wallet);
    } catch (err) {
        throw new Error(err.body ? JSON.stringify(err.body) : err.message);//evita 401 da Binance
    }
}

function stopUserDataMonitor(user, monitorId, logs) {
    const exchange = EXCHANGES[user.id];
    if (!exchange) return;

    exchange.terminateUserDataStream();
    if (logs) logger(`M:${monitorId}-${user.id}`, `User Data Monitor ${monitorId}-${user.id} stopped!`);

    hydra.clearWallet(user.id);
}

function notifyOrderUpdate(userId, order) {
    let type = '';
    switch (order.status) {
        case 'FILLED': type = 'success'; break;
        case 'REJECTED':
        case 'CANCELED':
        case 'EXPIRED': type = 'error'; break;
        default: type = 'info'; break;
    }

    sendMessage(userId, { notification: { text: `Order #${order.orderId} was updated as ${order.status}`, type } });
}

function processExecutionData(userId, monitorId, executionData, broadcastLabel) {
    if (executionData.x === orderStatus.NEW) return;//ignora as novas, pois podem ter vindo de outras fontes

    const order = {
        symbol: executionData.s,
        orderId: executionData.i,
        clientOrderId: executionData.X === orderStatus.CANCELED ? executionData.C : executionData.c,
        side: executionData.S,
        type: executionData.o,
        status: executionData.X,
        isMaker: executionData.m,
        transactTime: executionData.T
    }

    if (order.status === orderStatus.FILLED) {
        const quoteAmount = parseFloat(executionData.Z);
        order.avgPrice = quoteAmount / parseFloat(executionData.z);
        order.commission = executionData.n;
        
        const isQuoteCommission = executionData.N && order.symbol.endsWith(executionData.N);
        order.net = isQuoteCommission ? quoteAmount - parseFloat(order.commission) : quoteAmount;
    }

    if (order.status === orderStatus.REJECTED) order.obs = executionData.r;

    setTimeout(async () => {
        try {
            const updatedOrder = await ordersRepository.updateOrderByOrderId(order.orderId, order.clientOrderId, order);
            if (updatedOrder) {

                notifyOrderUpdate(userId, order);

                await hydra.updateMemory(order.symbol, `${indexKeys.LAST_ORDER}_${userId}`, null, updatedOrder.get({ plain: true }));

                if (broadcastLabel) WSS.direct(userId, { [broadcastLabel]: order });
            }
        } catch (err) {
            logger(`M:${monitorId}-${userId}`, err);
        }
    }, 3000)
}

async function processBalanceData(settings, user, monitorId, broadcastLabel, logs, data) {
    if (logs) logger(`M:${monitorId}-${user.id}`, data);

    try {
        const wallet = await loadWallet(settings, user);
        if (broadcastLabel && WSS) WSS.direct(user.id, { [broadcastLabel]: wallet });
    } catch (err) {
        if (logs) logger(`M:${monitorId}-${user.id}`, err);
    }
}

const EXCHANGES = {};

async function startUserDataMonitor(settings, user, monitorId, broadcastLabel, logs) {
    const [balanceBroadcast, executionBroadcast] = broadcastLabel ? broadcastLabel.split(',') : [null, null];

    try {
        await loadWallet(settings, user);

        const exchange = require('./utils/exchange')(settings, user);
        exchange.userDataStream(
            balanceData => processBalanceData(settings, user, monitorId, balanceBroadcast, logs, balanceData),
            executionData => {
                if (executionData.X === orderStatus.FILLED)
                    processBalanceData(settings, user, monitorId, balanceBroadcast, logs, executionData);
                processExecutionData(user.id, monitorId, executionData, executionBroadcast);
            }
        )
        EXCHANGES[user.id] = exchange;
        logger(`M:${monitorId}-${user.id}`, 'User Data Monitor has started!');
    }
    catch (err) {
        logger(`M:${monitorId}-${user.id}`, 'User Data Monitor has NOT started!\n' + err.message);
    }
}

async function processChartData(monitorId, symbol, indexes, interval, ohlc, logs) {
    if (typeof indexes === 'string') indexes = indexes.split(',');
    if (!indexes || !Array.isArray(indexes) || indexes.length === 0) return false;

    const calculatedIndexes = {};
    let executeAutomations = false;

    indexes.forEach(index => {
        const params = index.split('_');
        const indexName = params[0];
        params.splice(0, 1);

        try {
            const calc = execCalc(indexName, ohlc, ...params);
            if (logs) logger('M:' + monitorId, `${index}_${interval} calculated: ${JSON.stringify(calc.current ? calc.current : calc)}`);

            calculatedIndexes[index] = calc;
            if(!executeAutomations) executeAutomations = !!calc.current;
        } catch (err) {
            logger('M:' + monitorId, `Exchange Monitor => Can't calc the index ${index}:`);
            logger('M:' + monitorId, err);
            return false;
        }
    })

    return hydra.updateAllMemory(symbol, calculatedIndexes, interval, executeAutomations);
}

function startChartMonitor(userId, monitorId, symbol, interval, indexes, broadcastLabel, logs) {
    if (!symbol) return new Error(`Can't start a Chart Monitor without a symbol.`);
    if (!anonymousExchange) return new Error('Exchange Monitor not initialized yet.');

    anonymousExchange.chartStream(symbol, interval || '1m', async (ohlc) => {

        const lastCandle = {
            open: ohlc.open[ohlc.open.length - 1],
            close: ohlc.close[ohlc.close.length - 1],
            high: ohlc.high[ohlc.high.length - 1],
            low: ohlc.low[ohlc.low.length - 1],
            volume: ohlc.volume[ohlc.volume.length - 1],
            isComplete: ohlc.isComplete
        };

        const previousCandle = {
            open: ohlc.open[ohlc.open.length - 2],
            close: ohlc.close[ohlc.close.length - 2],
            high: ohlc.high[ohlc.high.length - 2],
            low: ohlc.low[ohlc.low.length - 2],
            volume: ohlc.volume[ohlc.volume.length - 2],
            isComplete: true
        };

        const previousPreviousCandle = {
            open: ohlc.open[ohlc.open.length - 3],
            close: ohlc.close[ohlc.close.length - 3],
            high: ohlc.high[ohlc.high.length - 3],
            low: ohlc.low[ohlc.low.length - 3],
            volume: ohlc.volume[ohlc.volume.length - 3],
            isComplete: true
        };

        if (logs) logger('M:' + monitorId, lastCandle);

        try {
            hydra.updateMemory(symbol, indexKeys.PREVIOUS_CANDLE, interval, {
                previous: previousPreviousCandle,
                current: previousCandle
            });

            hydra.updateMemory(symbol, indexKeys.LAST_CANDLE, interval, {
                previous: previousCandle,
                current: lastCandle
            });
            if (broadcastLabel && WSS) WSS.direct(userId, { [broadcastLabel]: lastCandle });

            processChartData(monitorId, symbol, indexes, interval, ohlc, logs);
        } catch (err) {
            if (logs) logger('M:' + monitorId, err);
        }
    })
    logger('M:' + monitorId, `Chart Monitor has started for ${symbol}_${interval}!`);
}

function stopChartMonitor(monitorId, symbol, interval, indexes, logs) {
    if (!symbol) return new Error(`Can't stop a Chart Monitor without a symbol.`);
    if (!anonymousExchange) return new Error('Exchange Monitor not initialized yet.');
    anonymousExchange.terminateChartStream(symbol, interval);
    if (logs) logger('M:' + monitorId, `Chart Monitor ${symbol}_${interval} stopped!`);

    hydra.deleteMemory(symbol, indexKeys.LAST_CANDLE, interval);

    if (indexes && Array.isArray(indexes))
        indexes.map(ix => hydra.deleteMemory(symbol, ix, interval));
}

function stopTickerMonitor(monitorId, symbol, logs) {
    if (!symbol) return new Error(`Can't stop a Ticker Monitor without a symbol.`);
    if (!anonymousExchange) return new Error('Exchange Monitor not initialized yet.');

    anonymousExchange.terminateTickerStream(symbol);

    if (logs) logger('M:' + monitorId, `Ticker Monitor ${symbol} stopped!`);

    hydra.deleteMemory(symbol, indexKeys.TICKER);
}

async function startTickerMonitor(userId, monitorId, symbol, broadcastLabel, logs) {
    if (!symbol) return new Error(`Can't start a Ticker Monitor without a symbol.`);
    if (!anonymousExchange) return new Error('Exchange Monitor not initialized yet.');

    anonymousExchange.tickerStream(symbol, async (data) => {
        if (logs) logger('M:' + monitorId, data);

        try {
            await hydra.updateMemory(data.symbol, indexKeys.TICKER, null, data);
            if (WSS && broadcastLabel) WSS.direct(userId, { [broadcastLabel]: data });
        }
        catch (err) {
            if (logs) logger('M:' + monitorId, err);
        }
    })
    logger('M:' + monitorId, `Ticker Monitor has started for ${symbol}`);
}

function getConnections() {
    return WSS.getConnections();
}

function sendMessage(userId, jsonObject) {
    try {
        if (jsonObject.notification)
            push.send(userId, jsonObject.notification.text, 'MegaSinal Notification', jsonObject.notification);
    } catch (err) {

    }

    return WSS.direct(userId, jsonObject);
}

async function init(settings, users, wssInstance, hydraInstance) {
    if (!settings || !hydraInstance) throw new Error(`You can't init the Exchange Monitor App without his settings. Check your database and/or startup code.`);

    WSS = wssInstance;
    hydra = hydraInstance;
    anonymousExchange = require('./utils/exchange')(settings);

    const monitors = await getActiveSystemMonitors();
    const miniTickerMonitor = monitors.find(m => m.type === monitorTypes.MINI_TICKER);

    if (miniTickerMonitor)
        startMiniTickerMonitor(miniTickerMonitor.id, miniTickerMonitor.broadcastLabel, miniTickerMonitor.logs);

    const bookMonitor = monitors.find(m => m.type === monitorTypes.BOOK);

    if (bookMonitor)
        startBookMonitor(bookMonitor.id, bookMonitor.broadcastLabel, bookMonitor.logs);

    const userDataMonitor = monitors.find(m => m.type === monitorTypes.USER_DATA);

    if (users) {
        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            setTimeout(async () => {

                if (userDataMonitor && userDataMonitor.isActive) user.monitors.push(userDataMonitor);

                user.monitors.filter(m => m.isActive).map(m => {
                    setTimeout(() => {
                        switch (m.type) {
                            case monitorTypes.USER_DATA: {
                                if (!user.accessKey || !user.secretKey) return;
                                return startUserDataMonitor(settings, user, m.id, m.broadcastLabel, m.logs);
                            }
                            case monitorTypes.CANDLES:
                                return startChartMonitor(user.id, m.id, m.symbol, m.interval, m.indexes ? m.indexes.split(',') : [], m.broadcastLabel, m.logs);
                            case monitorTypes.TICKER:
                                return startTickerMonitor(user.id, m.id, m.symbol, m.broadcastLabel, m.logs);
                        }
                    }, 250)//Binance only permits 5 commands / second
                })

                const lastOrders = await ordersRepository.getLastFilledOrders(user.id);
                await Promise.all(lastOrders.map(async (order) => {
                    await hydra.updateMemory(order.symbol, `${indexKeys.LAST_ORDER}_${user.id}`, null, order, false);
                }))
            }, i * (user.monitors.length + 1) * 250)
        }
    }

    logger('system', 'App Exchange Monitor is running!');
}

module.exports = {
    init,
    startChartMonitor,
    stopChartMonitor,
    startTickerMonitor,
    stopTickerMonitor,
    startUserDataMonitor,
    stopUserDataMonitor,
    loadWallet,
    getConnections,
    sendMessage
}
