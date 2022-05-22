const database = require('./db');
const app = require('./app');
const settingsRepository = require('./repositories/settingsRepository');
const usersRepository = require('./repositories/usersRepository');
const appEm = require('./app-em');
const appWs = require('./app-ws');
const hydra = require('./hydra');
const agenda = require('./agenda');
const logger = require('./utils/logger');
const Cache = require('./utils/cache');

(async () => {
    console.log(`Your Node.js version is ${process.version}.`);
    logger('system', 'Getting the default settings...');
    const settings = await settingsRepository.getDefaultSettings()
    if (!settings) throw new Error(`There is no settings.`);

    logger('system', 'Initializing the MegaSinal Brain...');

    let users = await usersRepository.getActiveUsers();
    users = users.map(u => u.get({ plain: true }));
    await hydra.init(users);

    logger('system', `Starting the MegaSinal Agenda...`);
    agenda.init(users.map(u => u.automations));

    logger('system', `Starting the server apps...`);
    const server = app.listen(process.env.PORT, () => {
        logger('system', 'App is running at ' + process.env.PORT);
    })

    const wss = appWs(server);

    appEm.init(settings, users, wss, hydra);

})();