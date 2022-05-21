const appEm = require('../app-em');
const monitorsRepository = require('../repositories/monitorsRepository');
const usersRepository = require('../repositories/usersRepository');
const strategiesRepository = require('../repositories/strategiesRepository');
const { monitorTypes } = require('../repositories/monitorsRepository');

function startStreamMonitor(monitor) {
    switch (monitor.type) {
        case monitorTypes.CANDLES: {
            //segregar por usuário
            appEm.startChartMonitor(monitor.userId, monitor.id, monitor.symbol, monitor.interval, monitor.indexes ? monitor.indexes.split(',') : [], monitor.broadcastLabel, monitor.logs);
            break;
        }
        case monitorTypes.TICKER: {
            //segregar por usuário
            appEm.startTickerMonitor(monitor.userId, monitor.id, monitor.symbol, monitor.broadcastLabel, monitor.logs);
            break;
        }
    }
}

function stopStreamMonitor(monitor) {
    switch (monitor.type) {
        case monitorTypes.CANDLES: {
            //segregar por usuário
            appEm.stopChartMonitor(monitor.id, monitor.symbol, monitor.interval, monitor.indexes ? monitor.indexes.split(',') : [], monitor.logs);
            break;
        }
        case monitorTypes.TICKER: {
            //segregar por usuário
            appEm.stopTickerMonitor(monitor.id, monitor.symbol, monitor.logs);
            break;
        }
    }
}

async function startMonitorExecution(monitor) {
    startStreamMonitor(monitor);

    monitor.isActive = true;
    await monitor.save();

    return monitor;
}

async function stopMonitorExecution(monitor) {
    stopStreamMonitor(monitor);

    monitor.isActive = false;
    await monitor.save();

    return monitor;
}

async function startMonitor(req, res, next) {
    const userId = res.locals.token.id;
    const id = req.params.id;
    const monitor = await monitorsRepository.getMonitor(id);
    if (monitor.isActive) return res.sendStatus(204);
    if (monitor.isSystemMon) return res.status(403).send(`You can't start or stop the system monitors.`);
    if (monitor.userId !== userId) return res.sendStatus(403);

    await startMonitorExecution(monitor);

    res.json(monitor);
}

async function stopMonitor(req, res, next) {
    const userId = res.locals.token.id;
    const id = req.params.id;
    const monitor = await monitorsRepository.getMonitor(id);
    if (!monitor.isActive) return res.sendStatus(204);
    if (monitor.isSystemMon) return res.status(403).send(`You can't start or stop the system monitors.`);
    if (monitor.userId !== userId) return res.sendStatus(403);

    await stopMonitorExecution(monitor);

    res.json(monitor);
}

async function getMonitor(req, res, next) {
    const userId = res.locals.token.id;
    const id = req.params.id;
    const monitor = await monitorsRepository.getMonitor(id);
    if (monitor.userId !== userId) return res.sendStatus(403);

    res.json(monitor);
}

async function getMonitors(req, res, next) {
    const userId = res.locals.token.id;
    const page = req.query.page;
    const symbol = req.query.symbol;

    let result;
    if (symbol)
        result = await monitorsRepository.getMonitorsBySymbol(userId, symbol);
    else
        result = await monitorsRepository.getMonitors(userId, page);
    res.json(result);
}

function validateMonitor(newMonitor) {
    if (newMonitor.type !== monitorTypes.CANDLES) {
        newMonitor.interval = null;
        newMonitor.indexes = null;

        if (newMonitor.type !== monitorTypes.TICKER)
            newMonitor.symbol = '*';
    }

    if (newMonitor.broadcastLabel === 'none')
        newMonitor.broadcastLabel = null;

    return newMonitor;
}

async function insertMonitor(req, res, next) {
    const userId = res.locals.token.id;
    const newMonitor = validateMonitor(req.body);
    newMonitor.userId = userId;

    const user = await usersRepository.getUser(userId, true);
    if (user.monitors.length >= user.limit.maxMonitors)
        return res.status(409).send(`You have reached the max monitors in your plan.`);

    const alreadyExists = await monitorsRepository.monitorExists(newMonitor.userId, newMonitor.type, newMonitor.symbol, newMonitor.interval);
    if (alreadyExists) return res.status(409).send(`Already exists a monitor with these params.`);

    const monitor = await monitorsRepository.insertMonitor(newMonitor);

    if (monitor.isActive) {
        startStreamMonitor(monitor);
    }

    res.status(201).json(monitor.get({ plain: true }));
}

async function updateMonitor(req, res, next) {
    const userId = res.locals.token.id;
    const id = req.params.id;
    const newMonitor = validateMonitor(req.body);
    newMonitor.userId = userId;

    const currentMonitor = await monitorsRepository.getMonitor(id);
    if (currentMonitor.isSystemMon || currentMonitor.userId !== userId) return res.sendStatus(403);

    const updatedMonitor = await monitorsRepository.updateMonitor(id, newMonitor);
    stopStreamMonitor(currentMonitor);

    if (updatedMonitor.isActive)
        startStreamMonitor(updatedMonitor);

    res.json(updatedMonitor);
}

async function deleteMonitor(req, res, next) {
    const userId = res.locals.token.id;
    const id = req.params.id;
    const currentMonitor = await monitorsRepository.getMonitor(id);
    if (currentMonitor.isSystemMon || currentMonitor.userId !== userId) return res.sendStatus(403);

    const strategies = await strategiesRepository.strategiesWithMonitor(id);
    if (strategies) return res.status(409).json(`Can't delete monitor. It is used by a strategy.`);

    if (currentMonitor.isActive) stopStreamMonitor(currentMonitor);

    await monitorsRepository.deleteMonitor(id);

    res.sendStatus(204);
}

module.exports = {
    startMonitor,
    stopMonitor,
    getMonitor,
    getMonitors,
    insertMonitor,
    updateMonitor,
    deleteMonitor,
    startMonitorExecution,
    stopMonitorExecution
}
