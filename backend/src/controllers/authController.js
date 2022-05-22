const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const settingsRepository = require('../repositories/settingsRepository');
const usersRepository = require('../repositories/usersRepository');
const Cache = require('../utils/cache');
const cache = new Cache();

async function doLogin(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const origin = req.headers.origin;

    let entity;
    console.log("email", email);
    console.log("password", password);
    console.log("origin", origin);
    if (origin === process.env.BEHOLDER_URL) {
        entity = await usersRepository.getUserByEmail(email);
        console.log("BEHOLDER entity", entity);
        if (!entity || !entity.isActive) return res.sendStatus(401);
    }
    else if (origin === process.env.MEGASINAL_URL) {
        entity = await settingsRepository.getSettingsByEmail(email);
        console.log("MEGASINAL entity", entity);
    }

    if (entity) {
        const isValid = bcrypt.compareSync(password, entity.password);
        if (isValid) {
            const token = jwt.sign({
                id: entity.id,
                profile: origin === process.env.BEHOLDER_URL ? 'USER' : 'ADMIN'
            },
                process.env.JWT_SECRET, {
                expiresIn: parseInt(process.env.JWT_EXPIRES)
            })
            return res.json({ token, pushToken: entity.pushToken });
        }
    }

    res.status(401).send('401 Unauthorized');
}

async function doLogout(req, res, next) {
    const token = req.headers['authorization'];
    await cache.set(token, true, parseInt(process.env.JWT_EXPIRES));
    return res.sendStatus(200);
}

function isBlacklisted(token) {
    return cache.get(token);
}

module.exports = {
    doLogin,
    doLogout,
    isBlacklisted
}